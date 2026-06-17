import { redisConnection } from './redis.config';
import { AppConfig } from './app.config';

export const defaultQueueOptions = {
    connection: redisConnection,
    prefix: `bull:${AppConfig.NODE_ENV}`,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential' as const,
            delay: 2000,
        },
        timeout: 5 * 60 * 1000,
        removeOnComplete: { count: 100 },
        removeOnFail: { age: 7 * 24 * 3600, count: 1000 },
    },
};
