import { AppConfig } from './app.config';

export const redisConnection = {
  host: AppConfig.REDIS_HOST,
  port: AppConfig.REDIS_PORT,
  password: AppConfig.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null,
  retryStrategy(times: number) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  reconnectOnError(err: Error) {
    if (err.message.includes('ECONNRESET')) {
      return true;
    }
    return false;
  },
  keepAlive: 30000,
  enableOfflineQueue: true,
};
