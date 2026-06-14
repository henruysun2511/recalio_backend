export const JwtConfig = {
  ACCESS_TOKEN_SECRET: process.env.JWT_ACCESS_TOKEN_SECRET ?? 'access-secret',
  ACCESS_TOKEN_EXPIRE: process.env.JWT_ACCESS_TOKEN_EXPIRE ?? '15m',
  REFRESH_TOKEN_SECRET:
    process.env.JWT_REFRESH_TOKEN_SECRET ?? 'refresh-secret',
  REFRESH_TOKEN_EXPIRE: process.env.JWT_REFRESH_TOKEN_EXPIRE ?? '7d',
};
