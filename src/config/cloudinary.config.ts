import { v2 as cloudinary } from 'cloudinary';
import { AppConfig } from './app.config';

export const CloudinaryConfig = {
  CLOUD_NAME: AppConfig.CLOUDINARY_CLOUD_NAME,
  API_KEY: AppConfig.CLOUDINARY_API_KEY,
  API_SECRET: AppConfig.CLOUDINARY_API_SECRET,
};

export const configureCloudinary = () => {
  cloudinary.config({
    cloud_name: CloudinaryConfig.CLOUD_NAME,
    api_key: CloudinaryConfig.API_KEY,
    api_secret: CloudinaryConfig.API_SECRET,
  });
  return cloudinary;
};
