import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/user.model.js";
dotenv.config();
const users = [
  {
    username: "Ramesh Delivery",
    email: "ramesh.delivery@example.com",
    password: "Delivery@123",
    role: "delivery-man",
    phoneNumber: "9001234581",
    isEmailVerified: true,
  },
  {
    username: "Vikram Delivery",
    email: "vikram.delivery@example.com",
    password: "Delivery@123",
    role: "delivery-man",
    phoneNumber: "9001234582",
    isEmailVerified: true,
  },
];

const seedUser = async () => {
  try {
    await mongoose.connect(process.env.DB_URI);
    console.log("Database connected successfully...");

    await User.insertMany(users);
    console.log("Mock users added successfully!");

    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

seedUser();
