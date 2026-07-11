import { BadRequestException, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

interface FileUploadOptions {
  fieldName?: string;
  maxSizeKB?: number;
  allowedMimeTypes?: string[];
  errorMessage?: string;
}

export function FileUploadInterceptor(options: FileUploadOptions = {}) {
  const {
    fieldName = 'file',
    maxSizeKB = 200,
    allowedMimeTypes,
    errorMessage = 'File không hợp lệ!',
  } = options;

  if (!allowedMimeTypes) {
    throw new BadRequestException('File type is required!');
  }

  return UseInterceptors(
    FileInterceptor(fieldName, {
      limits: {
        fileSize: maxSizeKB * 1024,
      },
      fileFilter: (req, file, cb) => {
        const isAllowed = allowedMimeTypes.includes(file.mimetype);

        if (!isAllowed) {
          return cb(new BadRequestException(errorMessage), false);
        }
        cb(null, true);
      },
    }),
  );
}
