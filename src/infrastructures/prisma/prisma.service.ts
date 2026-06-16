import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { CustomLogger } from '../logger/logger.service';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy {
  constructor(private readonly logger: CustomLogger) {
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL ?? '',
    });

    super({
      adapter,
      log: [
        { emit: 'event', level: 'error' },
        { emit: 'event', level: 'warn' },
      ],
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      const healthy = await this.isHealthy();

      if (!healthy) {
        this.logger.error('DB unreachable on startup');
        process.exit(1);
      }
      this.logger.log('Database connected successfully');
    } catch (err) {
      this.logger.error(
        'Failed to connect to database on startup',
        err instanceof Error ? err : new Error(String(err)),
      );
      process.exit(1);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Database disconnected');
  }

  async isHealthy(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }
}
