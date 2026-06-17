import { Injectable } from '@nestjs/common';
import { UploadApiErrorResponse, UploadApiResponse } from 'cloudinary';
import { v2 as cloudinary } from 'cloudinary';
import * as streamifier from 'streamifier';
import { CloudinaryError } from './cloudinary.error';
import { CLOUDINARY_CONSTANTS } from './cloudinary.constant';
import { IUploadMediaInput, DeleteMediaDto } from './cloudinary.dto';

type NormalizedUploadResponse = UploadApiResponse & { duration?: number; durationMs?: number };

@Injectable()
export class CloudinaryService {
  async uploadMedia(file: IUploadMediaInput): Promise<NormalizedUploadResponse> {
    const isAudio = file.mimetype.startsWith('audio/');
    const resourceType = isAudio ? 'video' : 'image';
    const folder = isAudio ? CLOUDINARY_CONSTANTS.FOLDERS.AUDIO : CLOUDINARY_CONSTANTS.FOLDERS.IMAGE;

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: resourceType,
        },
        (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
          if (error) return reject(CloudinaryError.uploadFailed(error.message));
          if (!result) return reject(CloudinaryError.uploadFailed('Empty upload response'));

          const resAny = result as any;
          const normalized: NormalizedUploadResponse = { ...(result as UploadApiResponse) } as NormalizedUploadResponse;
          if (typeof resAny.duration === 'number') {
            normalized.duration = resAny.duration;
            normalized.durationMs = Math.round(resAny.duration * 1000);
          }
          resolve(normalized);
        },
      );
      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  async deleteMedia(mediaDto: DeleteMediaDto) {
    try {
      const result = await cloudinary.uploader.destroy(mediaDto.publicId, { resource_type: mediaDto.resourceType });

      if (result.result === 'not_found') {
        throw CloudinaryError.fileNotFound();
      }

      return { data: result };
    } catch (error) {
      if (error instanceof Error) {
        throw CloudinaryError.deleteFailed(error.message);
      }
      throw error;
    }
  }


}
