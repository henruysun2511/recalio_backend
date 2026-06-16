import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructures/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateNoteDto, UpdateNoteDto, BatchUpsertNoteItem } from './note.dto';
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
            select: { ...noteSelect, userId: true },
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

    async batchUpsert(userId: string, deckId: string, items: BatchUpsertNoteItem[]) {
        return this.prisma.$transaction(async (tx) => {
            const allIds: string[] = [];
            const createData: any[] = [];
            const updatePairs: { id: string; data: any }[] = [];

            for (const item of items) {
                const data: any = {
                    templateId: item.templateId,
                    languageId: item.languageId,
                    word: item.word,
                    meaning: item.meaning,
                    ipa: item.ipa,
                    partOfSpeech: item.partOfSpeech,
                    example: item.example,
                    audioUrl: item.audioUrl,
                    imageUrl: item.imageUrl,
                    tags: item.tags ?? [],
                };
                if (item.fields) {
                    data.fields = item.fields as Prisma.InputJsonValue;
                }

                if (item.id) {
                    allIds.push(item.id);
                    updatePairs.push({ id: item.id, data });
                } else {
                    const id = crypto.randomUUID();
                    allIds.push(id);
                    createData.push({ id, userId, deckId, ...data });
                }
            }

            if (createData.length) {
                await tx.note.createMany({ data: createData });
            }
            for (const { id, data } of updatePairs) {
                await tx.note.update({ where: { id }, data });
            }

            return tx.note.findMany({
                where: { id: { in: allIds } },
                select: noteSelect,
            });
        });
    }
}
