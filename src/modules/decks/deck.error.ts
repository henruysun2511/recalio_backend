import { NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';

export class DeckError {
    static notFound() {
        return new NotFoundException('Deck không tồn tại');
    }

    static notOwner() {
        return new ForbiddenException('Bạn không có quyền thao tác với deck này');
    }

    static nameTaken(name: string) {
        return new ConflictException(`Bạn đã có deck tên "${name}"`);
    }
}
