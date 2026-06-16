import { BadRequestException, Injectable } from '@nestjs/common';
import { UploadApiErrorResponse, UploadApiResponse } from 'cloudinary';
import { v2 as cloudinary } from 'cloudinary';
import { env } from 'config';
import * as streamifier from 'streamifier';
import { IUploadMediaInput } from 'common/interfaces';

import { DeleteMediaDto } from './dtos';
type NormalizedUploadResponse = UploadApiResponse & { duration?: number; durationMs?: number };

@Injectable()
export class CloudinaryService {
  async uploadMedia(file: IUploadMediaInput, folder?: string): Promise<NormalizedUploadResponse> {
    const isVideo = file.mimetype.startsWith('video/');
    const isAudio = file.mimetype.startsWith('audio/');
    const resourceType = isVideo || isAudio ? 'video' : 'image';

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder || env.MAIN_FOLDER_UPLOAD_CLOUDINARY, // Dùng folder truyền vào hoặc mặc định
          resource_type: resourceType
        },
        (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
          if (error) return reject(new BadRequestException(error.message));
          if (!result) return reject(new BadRequestException('Empty upload response'));

          // normalize response
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const resAny = result as any;
          const normalized: NormalizedUploadResponse = { ...(result as UploadApiResponse) } as NormalizedUploadResponse;
          if (typeof resAny.duration === 'number') {
            normalized.duration = resAny.duration;
            normalized.durationMs = Math.round(resAny.duration * 1000);
          }
          resolve(normalized);
        }
      );
      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  async uploadMany(files: IUploadMediaInput[], folder?: string): Promise<NormalizedUploadResponse[]> {
    return Promise.all(files.map((file) => this.uploadMedia(file, folder)));
  }

  async deleteMedia(mediaDto: DeleteMediaDto) {
    try {
      const result = await cloudinary.uploader.destroy(mediaDto.publicId, { resource_type: mediaDto.resourceType });

      if (result.result === 'not_found') {
        throw new BadRequestException('File không tồn tại');
      }

      return {
        data: result
      };
    } catch (error) {
      throw new BadRequestException('Lỗi khi xoá file: ' + error.message);
    }
  }

  async deleteMany(mediaDtos: DeleteMediaDto[]) {
    try {
      const results = await Promise.all(
        mediaDtos.map((mediaDto) =>
          cloudinary.uploader.destroy(mediaDto.publicId, { resource_type: mediaDto.resourceType })
        )
      );

      const failedFiles = results.filter((result) => result.result === 'not_found');
      if (failedFiles.length > 0) {
        throw new BadRequestException(`${failedFiles.length} file không tồn tại`);
      }

      return {
        data: results,
        count: results.length
      };
    } catch (error) {
      throw new BadRequestException('Lỗi khi xoá nhiều file: ' + error.message);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async listResourcesByFolder(folder: string): Promise<any[]> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const resources: any[] = [];
      let nextCursor: string | undefined;

      // Paginate through all resources in folder
      do {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const response: any = await cloudinary.api.resources({
          type: 'upload',
          prefix: folder,
          max_results: 500,
          next_cursor: nextCursor
        });
        resources.push(...response.resources);
        nextCursor = response.next_cursor;
      } while (nextCursor);

      return resources;
    } catch (error) {
      throw new BadRequestException('Lỗi khi lấy danh sách file: ' + error.message);
    }
  }
}
