import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';

export class NoteTemplateError {
    static notFound() {
        return new NotFoundException('Note template không tồn tại');
    }

    static alreadyExists() {
        return new ConflictException('Note template này đã tồn tại');
    }

    static cardTemplateNotFound() {
        return new NotFoundException('Card template không tồn tại');
    }

    static fieldNameTooShort() {
        return new BadRequestException('Tên field không được để trống');
    }

    static cardTemplateNameRequired() {
        return new BadRequestException('Tên card template không được để trống');
    }
}
