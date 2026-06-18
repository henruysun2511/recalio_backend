import { BadRequestException } from '@nestjs/common';

export class AiError {
    static generationFailed() {
        return new BadRequestException('Không thể tạo notes');
    }

    static detectionFailed() {
        return new BadRequestException('Không thể nhận diện vật thể');
    }

    static aiNotConfigured() {
        return new BadRequestException('AI chưa được cấu hình (thiếu API key)');
    }

    static invalidInput() {
        return new BadRequestException('Phải cung cấp text hoặc topic');
    }
}
