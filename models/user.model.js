import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    profileImage: {
      url: {
        type: String,
      },
      publicId: {
        type: String,
      },
    },
    role: {
      type: String,
      enum: ["user", "delivery-man", "admin", "vendor"],
      default: "user",
    },
    address: [
      {
        label: String,
        street: String,
        city: String,
        pinCode: String,
        phoneNumber: String,
        isDefault: { type: Boolean, default: false },
      },
    ],
    pinCode: {
      type: String,
    },
    phoneNumber: {
      type: String,
      unique: true,
      sparse: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: String,
    emailVerificationExpires: Date,

    resetPasswordToken: String,
    resetPasswordExpires: Date,
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;
