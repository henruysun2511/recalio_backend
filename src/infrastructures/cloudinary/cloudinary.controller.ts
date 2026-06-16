import { Body, Controller, Delete, Post, UploadedFile } from '@nestjs/common';
import { MediaUploadInterceptor } from 'common/interceptors';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Public } from 'common/decorators';

import { CloudinaryService } from './cloudinary.service';
import { DeleteMediaDto } from './dtos';
import { CLOUDINARY_FOLDERS } from './constants';

@ApiBearerAuth()
@Controller('cloudinaries')
export class CloudinaryController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Public()
  @Post('media')
  @MediaUploadInterceptor()
  async uploadImages(@UploadedFile() file: Express.Multer.File, @Body('folder') folder: string) {
    return this.cloudinaryService.uploadMedia(file, folder);
  }

  @Post('avatars')
  @MediaUploadInterceptor()
  async uploadAvatar(@UploadedFile() file: Express.Multer.File) {
    return this.cloudinaryService.uploadMedia(file, CLOUDINARY_FOLDERS.AVATAR);
  }

  @Delete('media')
  async deleteMedia(@Body() dto: DeleteMediaDto) {
    return this.cloudinaryService.deleteMedia(dto);
  }
}
