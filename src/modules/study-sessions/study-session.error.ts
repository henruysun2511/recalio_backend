import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';

export class SessionError {
  static notFound() {
    return new NotFoundException('Phiên học không tồn tại');
  }

  static notOwner() {
    return new ForbiddenException(
      'Bạn không có quyền thao tác với phiên học này',
    );
  }

  static alreadyEnded() {
    return new BadRequestException('Phiên học đã kết thúc');
  }

  static tooManyActive() {
    return new BadRequestException('Đã đạt giới hạn phiên học đang mở');
  }
}
