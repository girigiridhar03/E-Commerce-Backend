import { uploadToCloudinary } from "../config/cloudinary.js";
import User from "../models/user.model.js";
import { AppError } from "../utils/AppError.js";
import { generateEmailVerification } from "../utils/generateUniqueCodes.js";
import { sendMail } from "../utils/mailer.js";

export const signupService = async (req) => {
  const { email, username, password, role, phoneNumber } = req.body;

  const requiredFields = ["email", "username", "password"];
  for (let field of requiredFields) {
    if (!req.body[field]) {
      throw new AppError(`${field} is required`, 400);
    }
  }

  const existingUser = await User.findOne({ email });

  if (existingUser && existingUser.isEmailVerified) {
    throw new AppError("Email is already taken", 400);
  }

  if (existingUser && !existingUser.isEmailVerified) {
    let uploadedFile = null;

    if (req?.file) {
      uploadedFile = await uploadToCloudinary(req.file.path, "users");
    }

    existingUser.username = username;
    existingUser.password = password;
    existingUser.role = role || existingUser.role;
    existingUser.phoneNumber = phoneNumber || existingUser.phoneNumber;

    existingUser.profileImage = {
      url: uploadedFile?.url || existingUser.profileImage?.url || null,
      publicId:
        uploadedFile?.public_id || existingUser.profileImage?.publicId || null,
    };

    const { token, expires } = generateEmailVerification();
    existingUser.emailVerificationToken = token;
    existingUser.emailVerificationExpires = expires;

    await existingUser.save();

    await sendMail({
      to: existingUser.email,
      subject: "Email Verification",
      html: `<p>Your new verification code: <b>${token}</b></p>`,
    });

    return {
      status: 200,
      message: `A new verification email has been sent to ${existingUser.email}`,
      user: existingUser,
    };
  }

  let uploadedFile = null;
  if (req?.file) {
    uploadedFile = await uploadToCloudinary(req.file.path, "users");
  }

  const newUser = new User({
    email,
    username,
    password,
    role,
    phoneNumber,
    profileImage: {
      url: uploadedFile?.url || null,
      publicId: uploadedFile?.public_id || null,
    },
  });

  const { token, expires } = generateEmailVerification();
  newUser.emailVerificationToken = token;
  newUser.emailVerificationExpires = expires;

  await newUser.save();

  await sendMail({
    to: newUser.email,
    subject: "Email Verification",
    html: `<p>Your verification code: <b>${token}</b></p>`,
  });

  return {
    status: 200,
    message: `Verification email sent to ${newUser.email}`,
    user: newUser,
  };
};

export const verifyEmailService = async (req) => {
  const { token } = req.params;

  const user = await User.findOne({
    emailVerificationToken: token,
    emailVerificationExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new AppError("Invalid or expired verification link", 400);
  }

  user.isEmailVerified = true;
  user.emailVerificationExpires = null;
  user.emailVerificationToken = null;

  await user.save();

  await sendMail({
    to: user.email,
    subject: "Email Verified",
    html: `<p>Email Verified, Welcome to All-In-One-Store`,
  });

  return {
    status: 200,
    message: "Email verified successfully",
  };
};

export const loginService = async (req) => {
  console.log(req.body, req);
  const { email, password } = req?.body;

  const user = await User.findOne({ email });

  if (!user) {
    throw new AppError("Invalid Credentials", 401);
  }

  if (!user.isEmailVerified) {
    throw new AppError("Please verify your email before logging in", 400);
  }

  if (user.isDeleted) {
    throw new AppError("Invalid email or password", 401);
  }

  const isPassword = await user.matchPassword(password);

  if (!isPassword) {
    throw new AppError("Invalid Credentials", 401);
  }

  const token = await user.generateToken();

  return {
    status: 200,
    message: "User logged in successfully",
    token,
  };
};
