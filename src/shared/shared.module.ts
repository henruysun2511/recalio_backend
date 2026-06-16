import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { APP_FILTER } from '@nestjs/core';
import { GlobalExceptionFilter } from '../common/filters/global-exception.filter';
import { PrismaModule } from '../infrastructures/prisma/prisma.module';
import { LoggerModule } from '../infrastructures/logger/logger.module';
import { JwtConfig } from '../config/jwt.config';

@Global()
@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        LoggerModule,
        PrismaModule,
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
    exports: [LoggerModule, PrismaModule, JwtModule],
})
export class SharedModule { }
