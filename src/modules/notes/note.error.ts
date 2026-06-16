import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';

export class NoteError {
    static notFound() {
        return new NotFoundException('Note không tồn tại');
    }

    static deckNotFound() {
        return new NotFoundException('Deck không tồn tại');
    }

    static notOwner() {
        return new ForbiddenException('Bạn không có quyền thao tác với note này');
    }

    static deckNotAccessible() {
        return new NotFoundException('Deck không tồn tại hoặc không thể truy cập');
    }

    static limitExceeded() {
        return new BadRequestException('Deck đã đạt giới hạn 100 notes');
    }
}
