import { NotFoundException, ForbiddenException } from '@nestjs/common';

export class DeckSettingError {
    static notFound() {
        return new NotFoundException('Cài đặt deck không tồn tại');
    }

    static notOwner() {
        return new ForbiddenException('Bạn không có quyền thao tác với deck này');
    }
}
