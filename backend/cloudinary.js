import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

let isCloudinaryConfigured = false;

if (process.env.CLOUDINARY_URL || (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET)) {
  if (process.env.CLOUDINARY_URL) {
    cloudinary.config();
  } else {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });
  }
  isCloudinaryConfigured = true;
  console.log("[CLOUDINARY] Cloudinary initialized successfully.");
} else {
  console.log("[CLOUDINARY] Cloudinary credentials not configured. Running on local image mode.");
}

/**
 * Uploads a base64 image string to Cloudinary.
 * @param {string} base64Data Base64 representation of image (e.g. data:image/png;base64,...)
 * @returns {Promise<string|null>} The secure URL of the uploaded image
 */
export async function uploadImageToCloudinary(base64Data) {
  if (!isCloudinaryConfigured) return null;
  try {
    const uploadResult = await cloudinary.uploader.upload(base64Data, {
      folder: 'saivi_collections'
    });
    return uploadResult.secure_url;
  } catch (error) {
    console.error("[CLOUDINARY] Upload base64 error:", error);
    throw error;
  }
}

/**
 * Uploads a local file to Cloudinary.
 * @param {string} localPath Path to the local file
 * @returns {Promise<string|null>} The secure URL of the uploaded image
 */
export async function uploadLocalFileToCloudinary(localPath) {
  if (!isCloudinaryConfigured) return null;
  try {
    const uploadResult = await cloudinary.uploader.upload(localPath, {
      folder: 'saivi_collections'
    });
    return uploadResult.secure_url;
  } catch (error) {
    console.error("[CLOUDINARY] Upload local file error:", error);
    throw error;
  }
}
