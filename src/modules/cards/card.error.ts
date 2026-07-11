import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';

export class CardError {
  static notFound() {
    return new NotFoundException('Card không tồn tại');
  }

  static notOwner() {
    return new ForbiddenException('Bạn không có quyền thao tác với card này');
  }

  static invalidRating() {
    return new BadRequestException('Rating không hợp lệ');
  }

  static suspended() {
    return new BadRequestException('Card đã bị suspend');
  }
}
