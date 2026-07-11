import { NotFoundException, BadRequestException } from '@nestjs/common';

export class NotificationError {
  static notFound() {
    return new NotFoundException('Thông báo không tồn tại');
  }

  static channelNotAllowed() {
    return new BadRequestException(
      'Loại thông báo này không hỗ trợ gửi qua EMAIL',
    );
  }
}
