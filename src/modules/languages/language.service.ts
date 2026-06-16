import { Injectable } from '@nestjs/common';
import { LanguageRepository } from './language.repository';
import { CreateLanguageDto, UpdateLanguageDto } from './language.dto';
import { LanguageError } from './language.error';

@Injectable()
export class LanguageService {
    constructor(private readonly repo: LanguageRepository) { }

    async create(dto: CreateLanguageDto) {
        const existing = await this.repo.findById(dto.id);
        if (existing) throw LanguageError.alreadyExists();

        return this.repo.create(dto);
    }

    async findAll() {
        return this.repo.findAll();
    }

    async findAllSupported() {
        return this.repo.findAllSupported();
    }

    async update(id: string, dto: UpdateLanguageDto) {
        const existing = await this.repo.findById(id);
        if (!existing) throw LanguageError.notFound();

        return this.repo.update(id, dto);
    }

    async delete(id: string) {
        const existing = await this.repo.findById(id);
        if (!existing) throw LanguageError.notFound();

        await this.repo.delete(id);
    }
}
