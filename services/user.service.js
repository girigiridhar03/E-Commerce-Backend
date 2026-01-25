import { uploadToCloudinary } from "../config/cloudinary.js";
import Cart from "../models/cart.model.js";
import Order from "../models/order.model.js";
import User from "../models/user.model.js";
import { AppError } from "../utils/AppError.js";
import { generateEmailVerification } from "../utils/generateUniqueCodes.js";
import { sendMail } from "../utils/mailer.js";

///// Auth Services /////
export const signupService = async (req) => {
  if (!req.body) {
    throw new AppError("body is empty", 400);
  }
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
  if (!req.body) {
    throw new AppError("body is empty", 400);
  }
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

  // const isPassword = await user.matchPassword(password);

  // if (!isPassword) {
  //   throw new AppError("Invalid Credentials", 401);
  // }

  const token = await user.generateToken();

  return {
    status: 200,
    message: "User logged in successfully",
    token,
    role: user?.role,
  };
};

export const meService = async (req) => {
  const userid = req.user.id;

  const userDetails = await User.findById(userid).select(
    "username email phoneNumber role address profileImage pincode createdAt",
  );

  if (!userDetails) {
    throw new AppError("User not found", 404);
  }

  return {
    status: 200,
    message: "User details fetched successfully",
    userDetails,
  };
};

///// Analytics Dashboard Services /////
export const getUserStatsService = async () => {
  const userStats = await User.aggregate([
    {
      $facet: {
        totalUsers: [{ $match: { role: "user" } }, { $count: "count" }],
        totalVendors: [{ $match: { role: "vendor" } }, { $count: "count" }],
        totalDeliveryMen: [
          { $match: { role: "delivery-man" } },
          { $count: "count" },
        ],
        emailVerifiedUsers: [
          { $match: { isEmailVerified: true } },
          { $count: "count" },
        ],
      },
    },
    {
      $project: {
        totalUsers: {
          $ifNull: [{ $arrayElemAt: ["$totalUsers.count", 0] }, 0],
        },
        totalVendors: {
          $ifNull: [{ $arrayElemAt: ["$totalVendors.count", 0] }, 0],
        },
        totalDeliveryMen: {
          $ifNull: [{ $arrayElemAt: ["$totalDeliveryMen.count", 0] }, 0],
        },
        emailVerifiedUsers: {
          $ifNull: [{ $arrayElemAt: ["$emailVerifiedUsers.count", 0] }, 0],
        },
      },
    },
  ]);

  return {
    status: 200,
    message: "User Stats fetched successfully",
    userStats: userStats?.[0],
  };
};

export const getSignUpTrendsService = async (req) => {
  const { range, startDate, endDate } = req.query;
  const now = new Date();

  let from = startDate ? new Date(startDate) : null;
  let to = endDate ? new Date(endDate) : null;

  if (!from) {
    const days = Number(range) || 30;
    from = new Date();
    from.setDate(now.getDate() - days);
  }

  if (!to) {
    to = new Date();
    to.setHours(23, 59, 59, 999);
  }

  const signUpTrends = await User.aggregate([
    {
      $match: {
        createdAt: {
          $gte: from,
          $lte: to,
        },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          day: { $dayOfMonth: "$createdAt" },
        },
        signups: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        date: {
          $dateFromParts: {
            year: "$_id.year",
            month: "$_id.month",
            day: "$_id.day",
          },
        },
        signups: 1,
      },
    },
    { $sort: { date: 1 } },
  ]);

  return {
    status: 200,
    message: "SignUp Trends fetched successfully",
    trends: signUpTrends,
  };
};

export const getUserRoleDistributionService = async () => {
  const roleCount = await User.aggregate([
    {
      $group: {
        _id: "$role",
        count: {
          $sum: 1,
        },
      },
    },
    {
      $project: {
        _id: 0,
        role: "$_id",
        count: 1,
      },
    },
    {
      $sort: {
        count: -1,
      },
    },
  ]);

  return {
    status: 200,
    message: "User role distribution count fetched successfully.",
    roleCount,
  };
};

export const getNewUsersService = async () => {
  const now = new Date();

  let from = new Date();
  from.setDate(now.getDate() - 7);

  let to = new Date();
  to.setHours(23, 59, 59, 999);

  const latestUsers = await User.aggregate([
    {
      $match: {
        createdAt: {
          $gte: from,
          $lte: to,
        },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          day: { $dayOfMonth: "$createdAt" },
        },
        newSignUps: {
          $sum: 1,
        },
      },
    },
    {
      $project: {
        _id: 0,
        date: {
          $dateFromParts: {
            year: "$_id.year",
            month: "$_id.month",
            day: "$_id.day",
          },
        },
        newSignUps: 1,
      },
    },
  ]);

  return {
    status: 200,
    message: "Lates Users fetched successfully.",
    latestUsers,
  };
};

///// Dynamic Services /////
export const singleUserDetailsService = async (req) => {
  const loggedInUser = req.user;
  const targetUserId = req.params.id;
  const userDetails = await User.findById(targetUserId).select("-password");

  if (loggedInUser.role === "admin" || loggedInUser.role === "vendor") {
    const cartDetails = await Cart.find({ user: targetUserId });
    const orderDetails = await Order.find({ user: targetUserId });

    return {
      status: 200,
      messsage: `${userDetails.username} full details fetched successfully.`,
      details: { userDetails, cartDetails, orderDetails },
    };
  }

  if (loggedInUser.id !== targetUserId) {
    throw new AppError("Access denied", 403);
  }

  return {
    status: 200,
    messsage: `${userDetails.username} details fetched successfully.`,
    details: userDetails,
  };
};
