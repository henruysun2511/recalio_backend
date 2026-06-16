import { NotFoundException, ForbiddenException, ConflictException, BadRequestException } from '@nestjs/common';

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

    static alreadyCloned() {
        return new ConflictException('Bạn đã clone deck này rồi');
    }

    static cannotCloneOwn() {
        return new BadRequestException('Không thể clone deck của chính mình');
    }
}
