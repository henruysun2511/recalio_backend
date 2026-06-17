import { Body, Controller, Delete, Post, UploadedFile } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { FileUploadInterceptor } from '../../common/interceptors/upload.interceptor';
import { TimeoutInterceptor } from '../../common/interceptors/timeout.interceptor';
import { CloudinaryService } from './cloudinary.service';
import { DeleteMediaDto } from './cloudinary.dto';
import { CLOUDINARY_CONSTANTS } from './cloudinary.constant';

@ApiTags('Cloudinaries')
@ApiBearerAuth()
@Controller('cloudinaries')
export class CloudinaryController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Post('media')
  @FileUploadInterceptor({
    maxSizeKB: 512000,
    allowedMimeTypes: [...CLOUDINARY_CONSTANTS.ALLOWED_MIME_TYPES],
    errorMessage: 'Chỉ được upload ảnh và audio!',
  })
  @TimeoutInterceptor(120000)
  async uploadMedia(@UploadedFile() file: Express.Multer.File) {
    return this.cloudinaryService.uploadMedia(file);
  }

  @Delete('media')
  @TimeoutInterceptor(30000)
  async deleteMedia(@Body() dto: DeleteMediaDto) {
    return this.cloudinaryService.deleteMedia(dto);
  }
}
