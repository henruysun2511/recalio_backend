export const AppConfig = {
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  PORT: parseInt(process.env.PORT ?? '3000', 10),
  CLIENT_URL: process.env.CLIENT_URL ?? 'http://localhost:3000',
  IS_DEV: process.env.NODE_ENV === 'development',
  IS_PROD: process.env.NODE_ENV === 'production',
  CORS_ORIGINS: process.env.CORS_ORIGINS?.split(',') ?? [
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
};
