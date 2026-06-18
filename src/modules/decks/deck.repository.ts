import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructures/prisma/prisma.service';
import { CreateDeckDto, UpdateDeckDto, QueryDeckDto } from './deck.dto';
import { SortOrder } from '../../common/enums/sort.enum';
import { Prisma, CardState } from '@prisma/client';

const deckListSelect = {
    id: true,
    userId: true,
    name: true,
    fullPath: true,
    description: true,
    coverImage: true,
    isArchived: true,
    isPublic: true,
    tags: true,
    downloadCount: true,
    createdAt: true,
    updatedAt: true,
} satisfies Prisma.DeckSelect;

const deckCheckSelect = {
    id: true,
    userId: true,
    name: true,
    deletedAt: true,
    isBanned: true,
    isPublic: true,
} satisfies Prisma.DeckSelect;

const deckPublicSelect = {
    ...deckListSelect,
    user: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
    _count: { select: { notes: true, cards: true } },
} satisfies Prisma.DeckSelect;

const deckMySelect = {
    ...deckListSelect,
    _count: { select: { notes: true, cards: true } },
} satisfies Prisma.DeckSelect;

@Injectable()
export class DeckRepository {
    constructor(private readonly prisma: PrismaService) { }

    async create(userId: string, dto: CreateDeckDto) {
        return this.prisma.deck.create({
            data: {
                userId,
                name: dto.name,
                fullPath: dto.fullPath ?? dto.name,
                description: dto.description,
                coverImage: dto.coverImage,
                isPublic: dto.isPublic ?? false,
                tags: dto.tags ?? [],
                parentId: dto.parentId,
                setting: { create: {} },
            },
            select: deckMySelect,
        });
    }

    async findById(id: string) {
        return this.prisma.deck.findUnique({
            where: { id },
            select: deckCheckSelect,
        });
    }

    async findByIdFull(id: string) {
        return this.prisma.deck.findUnique({
            where: { id },
            select: deckMySelect,
        });
    }

    async findByName(userId: string, name: string, excludeId?: string) {
        return this.prisma.deck.findFirst({
            where: {
                userId,
                name,
                deletedAt: null,
                ...(excludeId ? { id: { not: excludeId } } : {}),
            },
            select: { id: true },
        });
    }

    async findPublicById(id: string) {
        return this.prisma.deck.findFirst({
            where: { id, isBanned: false, isArchived: false, deletedAt: null },
            select: deckPublicSelect,
        });
    }

    async findPublicDecks(dto: QueryDeckDto) {
        const where: any = {
            isPublic: true,
            isArchived: false,
            isBanned: false,
            deletedAt: null,
        };

        if (dto.search) {
            where.OR = [
                { name: { contains: dto.search, mode: 'insensitive' } },
                { description: { contains: dto.search, mode: 'insensitive' } },
                { tags: { has: dto.search.toLowerCase() } },
            ];
        }

        const [items, total] = await Promise.all([
            this.prisma.deck.findMany({
                where,
                skip: dto.skip,
                take: dto.take,
                orderBy: { [dto.sort ?? 'createdAt']: dto.sortOrder ?? SortOrder.DESC },
                select: deckPublicSelect,
            }),
            this.prisma.deck.count({ where }),
        ]);

        return { items, total };
    }

    async findMyDecks(userId: string, dto: QueryDeckDto) {
        const where: any = {
            userId,
            deletedAt: null,
        };

        if (dto.search) {
            where.OR = [
                { name: { contains: dto.search, mode: 'insensitive' } },
                { description: { contains: dto.search, mode: 'insensitive' } },
            ];
        }
        if (dto.isPublic !== undefined) {
            where.isPublic = dto.isPublic;
        }

        const [items, total] = await Promise.all([
            this.prisma.deck.findMany({
                where,
                skip: dto.skip,
                take: dto.take,
                orderBy: { [dto.sort ?? 'createdAt']: dto.sortOrder ?? SortOrder.DESC },
                select: deckMySelect,
            }),
            this.prisma.deck.count({ where }),
        ]);

        return { items, total };
    }

    async findArchivedDecks(userId: string, dto: QueryDeckDto) {
        const where: any = {
            userId,
            isArchived: true,
            deletedAt: null,
        };

        if (dto.search) {
            where.OR = [
                { name: { contains: dto.search, mode: 'insensitive' } },
                { description: { contains: dto.search, mode: 'insensitive' } },
            ];
        }

        const [items, total] = await Promise.all([
            this.prisma.deck.findMany({
                where,
                skip: dto.skip,
                take: dto.take,
                orderBy: { [dto.sort ?? 'createdAt']: dto.sortOrder ?? SortOrder.DESC },
                select: deckListSelect,
            }),
            this.prisma.deck.count({ where }),
        ]);

        return { items, total };
    }

    async update(id: string, dto: UpdateDeckDto) {
        return this.prisma.deck.update({
            where: { id },
            data: dto,
            select: deckMySelect,
        });
    }

    async softDelete(id: string) {
        return this.prisma.deck.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }

    async move(id: string, parentId: string | null) {
        return this.prisma.deck.update({
            where: { id },
            data: { parentId },
            select: deckListSelect,
        });
    }

    async findSourceForClone(id: string) {
        return this.prisma.deck.findFirst({
            where: { id, isPublic: true, isBanned: false, deletedAt: null },
            select: {
                id: true,
                userId: true,
                name: true,
                fullPath: true,
                description: true,
                coverImage: true,
                tags: true,
                setting: {
                    select: {
                        algorithm: true,
                        newCardsPerDay: true,
                        reviewsPerDay: true,
                        learningSteps: true,
                        graduatingInterval: true,
                        easyInterval: true,
                        intervalModifier: true,
                        easyBonus: true,
                        hardInterval: true,
                        maximumInterval: true,
                        lapseSteps: true,
                        minimumInterval: true,
                        leechThreshold: true,
                        leechAction: true,
                        fsrsWeights: true,
                        requestRetention: true,
                    },
                },
                notes: {
                    where: { deletedAt: null },
                    select: {
                        id: true,
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
                        cards: {
                            select: {
                                id: true,
                                cardTemplateId: true,
                                flags: true,
                            },
                        },
                    },
                },
            },
        });
    }

    async deepClone(userId: string, source: NonNullable<Awaited<ReturnType<DeckRepository['findSourceForClone']>>>) {
        return this.prisma.$transaction(async (tx) => {
            const newDeckId = crypto.randomUUID();

            await tx.deck.create({
                data: {
                    id: newDeckId,
                    userId,
                    name: source.name,
                    fullPath: source.fullPath,
                    description: source.description,
                    coverImage: source.coverImage,
                    tags: source.tags,
                    sourceDeckId: source.id,
                    isPublic: false,
                },
                select: { id: true },
            });

            if (source.setting) {
                await tx.deckSetting.create({
                    data: { deckId: newDeckId, ...source.setting },
                });
            }

            if (source.notes.length) {
                const oldToNewNoteId = new Map<string, string>();
                const noteData = source.notes.map((note) => {
                    const newId = crypto.randomUUID();
                    oldToNewNoteId.set(note.id, newId);
                    return {
                        id: newId,
                        userId,
                        deckId: newDeckId,
                        templateId: note.templateId,
                        languageId: note.languageId,
                        word: note.word,
                        meaning: note.meaning,
                        ipa: note.ipa,
                        partOfSpeech: note.partOfSpeech,
                        example: note.example,
                        audioUrl: note.audioUrl,
                        imageUrl: note.imageUrl,
                        tags: note.tags,
                        fields: note.fields ?? {},
                    };
                });

                await tx.note.createMany({ data: noteData });

                const cardData = source.notes.flatMap((note) =>
                    note.cards.map((card) => ({
                        id: crypto.randomUUID(),
                        userId,
                        noteId: oldToNewNoteId.get(note.id)!,
                        cardTemplateId: card.cardTemplateId,
                        deckId: newDeckId,
                        flags: card.flags,
                        state: CardState.NEW,
                        due: new Date(),
                        interval: 0,
                        easeFactor: 2.5,
                        repetitions: 0,
                        lapses: 0,
                        currentStep: 0,
                    })),
                );

                await tx.card.createMany({ data: cardData });
            }

            await tx.deck.update({
                where: { id: source.id },
                data: { downloadCount: { increment: 1 } },
            });

            return tx.deck.findUnique({
                where: { id: newDeckId },
                select: deckListSelect,
            });
        });
    }

    async findCloneByUser(userId: string, sourceDeckId: string) {
        return this.prisma.deck.findFirst({
            where: { userId, sourceDeckId, deletedAt: null },
            select: { id: true },
        });
    }

    async findParentDepth(parentId: string): Promise<number> {
        const parent = await this.prisma.deck.findUnique({
            where: { id: parentId },
            select: { parentId: true },
        });
        if (!parent) return 0;
        return 1 + (parent.parentId ? await this.findParentDepth(parent.parentId) : 0);
    }

    async ban(id: string) {
        return this.prisma.deck.update({
            where: { id },
            data: {
                isBanned: true,
                isPublic: false,
                isFeatured: false,
            },
            select: deckListSelect,
        });
    }

    async unban(id: string) {
        return this.prisma.deck.update({
            where: { id },
            data: { isBanned: false },
            select: deckListSelect,
        });
    }

    async findClonedDecks(userId: string, dto: QueryDeckDto) {
        const where: any = {
            userId,
            sourceDeckId: { not: null },
            deletedAt: null,
        };

        if (dto.search) {
            where.OR = [
                { name: { contains: dto.search, mode: 'insensitive' } },
                { description: { contains: dto.search, mode: 'insensitive' } },
            ];
        }

        const [items, total] = await Promise.all([
            this.prisma.deck.findMany({
                where,
                skip: dto.skip,
                take: dto.take,
                orderBy: { [dto.sort ?? 'createdAt']: dto.sortOrder ?? SortOrder.DESC },
                select: deckMySelect,
            }),
            this.prisma.deck.count({ where }),
        ]);

        return { items, total };
    }
}
