import { NotFoundException, ConflictException } from '@nestjs/common';

export class AchievementError {
  static notFound() {
    return new NotFoundException('Không tìm thấy thành tích');
  }

  static keyExists(key: string) {
    return new ConflictException(`Key thành tích "${key}" đã tồn tại`);
  }
}
