import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { APP_FILTER } from '@nestjs/core';
import { GlobalExceptionFilter } from '../common/filters/global-exception.filter';
import { PrismaModule } from './prisma/prisma.module';
import { LoggerModule } from './logger/logger.module';
import { SupabaseModule } from './supabase/supabase.module';
import { JwtConfig } from '../config/jwt.config';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    LoggerModule,
    PrismaModule,
    SupabaseModule,
    JwtModule.register({
      secret: JwtConfig.ACCESS_TOKEN_SECRET,
      signOptions: { expiresIn: JwtConfig.ACCESS_TOKEN_EXPIRE as any },
    }),
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
  exports: [LoggerModule, PrismaModule, SupabaseModule, JwtModule],
})
export class SharedModule {}
