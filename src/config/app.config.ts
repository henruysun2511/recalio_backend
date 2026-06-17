import 'dotenv/config';

export const AppConfig = {
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  PORT: parseInt(process.env.PORT ?? '3000', 10),
  CLIENT_URL: process.env.CLIENT_URL ?? 'http://localhost:3000',
  IS_DEV: process.env.NODE_ENV === 'development',
  IS_PROD: process.env.NODE_ENV === 'production',
  CORS_ORIGINS: process.env.CORS_ORIGINS?.split(',')?.filter(Boolean) || [
    'http://localhost:3000',
  ],
  CORS_METHODS: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  CORS_CREDENTIALS: process.env.CORS_CREDENTIALS === 'true',
  LOGGER: {
    CONSOLE_LEVEL:
      process.env.LOGGER_CONSOLE_LEVEL ??
      (process.env.NODE_ENV === 'production' ? 'info' : 'silly'),
    LOGTAIL_LEVEL: process.env.LOGGER_LOGTAIL_LEVEL ?? 'warn',
  },

  // JWT
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_TOKEN_SECRET ?? 'access-secret',
  JWT_ACCESS_EXPIRE: process.env.JWT_ACCESS_TOKEN_EXPIRE ?? '15m',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_TOKEN_SECRET ?? 'refresh-secret',
  JWT_REFRESH_EXPIRE: process.env.JWT_REFRESH_TOKEN_EXPIRE ?? '7d',

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME ?? '',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY ?? '',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET ?? '',

  // Cloudinary
  CLOUDINARY_AUDIO_FOLDER: process.env.CLOUDINARY_AUDIO_FOLDER ?? 'recalio/audio',

  // Redis
  REDIS_HOST: process.env.REDIS_HOST ?? 'localhost',
  REDIS_PORT: parseInt(process.env.REDIS_PORT ?? '6379', 10),
  REDIS_PASSWORD: process.env.REDIS_PASSWORD ?? '',

  // Google OAuth
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ?? '',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ?? '',
  GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL ?? 'http://localhost:3000/auth/google/callback',
};
