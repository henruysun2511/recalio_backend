import { v2 as cloudinary } from 'cloudinary';
import { AppConfig } from './app.config';

export const configureCloudinary = () => {
  cloudinary.config({
    cloud_name: AppConfig.CLOUDINARY_CLOUD_NAME,
    api_key: AppConfig.CLOUDINARY_API_KEY,
    api_secret: AppConfig.CLOUDINARY_API_SECRET,
  });
};
