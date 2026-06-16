import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructures/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateLanguageDto, UpdateLanguageDto } from './language.dto';

const languageSelect = {
    id: true,
    name: true,
    nativeName: true,
    flagEmoji: true,
    isSupported: true,
} satisfies Prisma.LanguageSelect;

@Injectable()
export class LanguageRepository {
    constructor(private readonly prisma: PrismaService) { }

    async create(dto: CreateLanguageDto) {
        return this.prisma.language.create({
            data: dto,
            select: languageSelect,
        });
    }

    async findAll() {
        return this.prisma.language.findMany({
            orderBy: { name: 'asc' },
            select: languageSelect,
        });
    }

    async findAllSupported() {
        return this.prisma.language.findMany({
            where: { isSupported: true },
            orderBy: { name: 'asc' },
            select: languageSelect,
        });
    }

    async findById(id: string) {
        return this.prisma.language.findUnique({
            where: { id },
            select: languageSelect,
        });
    }

    async update(id: string, dto: UpdateLanguageDto) {
        return this.prisma.language.update({
            where: { id },
            data: dto,
            select: languageSelect,
        });
    }

    async delete(id: string) {
        return this.prisma.language.delete({ where: { id } });
    }
}
