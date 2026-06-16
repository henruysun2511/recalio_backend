import { Transform } from 'class-transformer';
import { IsIn, IsNotEmpty, IsString } from 'class-validator';

const ALLOWED_CLOUDINARY_RESOURCE_TYPES = ['image', 'video', 'raw'] as const;

export class DeleteMediaDto {
  @IsString()
  @IsNotEmpty()
  publicId: string;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.toLowerCase?.())
  @IsIn(ALLOWED_CLOUDINARY_RESOURCE_TYPES, {
    message: `resourceType must be one of: ${ALLOWED_CLOUDINARY_RESOURCE_TYPES.join(', ')}`
  })
  resourceType: (typeof ALLOWED_CLOUDINARY_RESOURCE_TYPES)[number];
}
