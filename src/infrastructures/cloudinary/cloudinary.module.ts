import { Module } from '@nestjs/common';
import { configureCloudinary } from '../../config/cloudinary.config';
import { CloudinaryService } from './cloudinary.service';
import { CloudinaryController } from './cloudinary.controller';

@Module({
  controllers: [CloudinaryController],
  providers: [CloudinaryService],
  exports: [CloudinaryService],
})
export class CloudinaryModule {
  constructor() {
    configureCloudinary();
  }
}
