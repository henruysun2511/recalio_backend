import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructures/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateNoteDto, UpdateNoteDto } from './note.dto';
import { PaginationDto } from '../../common/dtos/pagination.dto';
import { SortOrder } from '../../common/enums/sort.enum';

const noteSelect = {
    id: true,
    deckId: true,
    templateId: true,
    languageId: true,
    word: true,
    meaning: true,
    ipa: true,
    partOfSpeech: true,
    example: true,
    audioUrl: true,
    imageUrl: true,
    tags: true,
    fields: true,
    createdAt: true,
    updatedAt: true,
} satisfies Prisma.NoteSelect;

@Injectable()
export class NoteRepository {
    constructor(private readonly prisma: PrismaService) { }

    async create(userId: string, deckId: string, dto: CreateNoteDto) {
        return this.prisma.note.create({
            data: {
                userId,
                deckId,
                templateId: dto.templateId,
                languageId: dto.languageId,
                word: dto.word,
                meaning: dto.meaning,
                ipa: dto.ipa,
                partOfSpeech: dto.partOfSpeech,
                example: dto.example,
                audioUrl: dto.audioUrl,
                imageUrl: dto.imageUrl,
                tags: dto.tags ?? [],
                fields: (dto.fields ?? {}) as Prisma.InputJsonValue,
            },
            select: noteSelect,
        });
    }

    async findByDeck(deckId: string, dto: PaginationDto) {
        const where = { deckId, deletedAt: null };

        const [items, total] = await Promise.all([
            this.prisma.note.findMany({
                where,
                skip: dto.skip,
                take: dto.limit,
                orderBy: { createdAt: SortOrder.DESC },
                select: noteSelect,
            }),
            this.prisma.note.count({ where }),
        ]);

        return { items, total };
    }

    async findById(id: string) {
        return this.prisma.note.findUnique({
            where: { id },
            select: noteSelect,
        });
    }

    async findByIdFull(id: string) {
        return this.prisma.note.findUnique({
            where: { id, deletedAt: null },
            select: {
                ...noteSelect,
                userId: true,
            },
        });
    }

    async update(id: string, dto: UpdateNoteDto) {
        const data: any = { ...dto };
        if (dto.fields) {
            data.fields = dto.fields as Prisma.InputJsonValue;
        }
        return this.prisma.note.update({
            where: { id },
            data,
            select: noteSelect,
        });
    }

    async softDelete(id: string) {
        return this.prisma.note.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }
}
