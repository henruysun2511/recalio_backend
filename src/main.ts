import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './common/interceptors/transform.interceptor';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { AppConfig } from './config/app.config';
import { configureCloudinary } from './config/cloudinary.config';

async function bootstrap() {
    configureCloudinary();
    const app = await NestFactory.create(AppModule);

    app.enableCors({
        origin: AppConfig.CORS_ORIGINS,
        methods: AppConfig.CORS_METHODS,
        credentials: AppConfig.CORS_CREDENTIALS,
    });

    const reflector = app.get(Reflector);
    app.useGlobalInterceptors(new ResponseInterceptor(reflector));
    app.useGlobalGuards(new JwtAuthGuard(reflector), new RolesGuard(reflector));

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );

    app.setGlobalPrefix('api');
    app.enableVersioning({
        type: VersioningType.URI,
        defaultVersion: ['1'],
    });

    app.enableShutdownHooks();

    if (AppConfig.IS_DEV) {
        const swaggerConfig = new DocumentBuilder()
            .setTitle('Recalio API')
            .setDescription('API Documentation')
            .setVersion('1.0')
            .addBearerAuth()
            .build();

        const document = SwaggerModule.createDocument(app, swaggerConfig);
        SwaggerModule.setup('api/docs', app, document, {
            swaggerOptions: { persistAuthorization: true },
        });
    }

    await app.listen(AppConfig.PORT);
    console.log(`Server running on http://localhost:${AppConfig.PORT}/api/v1`);
    if (AppConfig.IS_DEV) {
        console.log(`Swagger docs: http://localhost:${AppConfig.PORT}/api/docs`);
    }
}
void bootstrap();
