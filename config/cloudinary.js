import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import fs from "fs";
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = async (localFilePath) => {
  if (!localFilePath) return null;
  try {
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
      folder: "e-commerce",
    });
    fs.promises
      .unlink(localFilePath)
      .catch((error) => console.log("Upload file failed: ", error));

    return response;
  } catch (error) {
    fs.promises.unlink(localFilePath).catch(error);
    console.log("upload to cloudinary failed", error);
    return null;
  }
};

export const deleteFileFromCloudinary = async (publicId) => {
  if (!publicId) return null;
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.log("deleting failed: ", error);
  }
};
