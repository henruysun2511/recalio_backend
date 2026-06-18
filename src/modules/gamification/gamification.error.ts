import { NotFoundException } from '@nestjs/common';

export class GamificationError {
    static userXpNotFound() {
        return new NotFoundException('Không tìm thấy thông tin XP của người dùng');
    }
}
