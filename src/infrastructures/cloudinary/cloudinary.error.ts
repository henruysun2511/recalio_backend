import { BadRequestException, NotFoundException } from '@nestjs/common';

export class CloudinaryError {
  static uploadFailed(message: string) {
    return new BadRequestException('Upload thất bại: ' + message);
  }

  static fileNotFound() {
    return new NotFoundException('File không tồn tại');
  }

  static deleteFailed(message: string) {
    return new BadRequestException('Lỗi khi xoá file: ' + message);
  }
}
