import { NotFoundException, ConflictException } from '@nestjs/common';

export class LanguageError {
    static notFound() {
        return new NotFoundException('Ngôn ngữ không tồn tại');
    }

    static alreadyExists() {
        return new ConflictException('Ngôn ngữ này đã tồn tại');
    }
}
