import { Transform } from 'class-transformer';
import { IsIn, IsNotEmpty, IsString } from 'class-validator';
import { CLOUDINARY_CONSTANTS } from './cloudinary.constant';

export interface IUploadMediaInput {
  buffer: Buffer;
  mimetype: string;
  originalname?: string;
  size?: number;
}

export class DeleteMediaDto {
  @IsString()
  @IsNotEmpty()
  publicId: string;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.toLowerCase?.())
  @IsIn(CLOUDINARY_CONSTANTS.ALLOWED_RESOURCE_TYPES, {
    message: `resourceType must be one of: ${CLOUDINARY_CONSTANTS.ALLOWED_RESOURCE_TYPES.join(', ')}`,
  })
  resourceType: (typeof CLOUDINARY_CONSTANTS.ALLOWED_RESOURCE_TYPES)[number];
}
