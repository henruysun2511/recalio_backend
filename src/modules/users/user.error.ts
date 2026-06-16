import { NotFoundException } from '@nestjs/common';

export class UserError {
    static notFound() {
        return new NotFoundException('Người dùng không tồn tại');
    }
}
