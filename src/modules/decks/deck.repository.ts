import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructures/prisma/prisma.service';
import { CreateDeckDto, UpdateDeckDto, QueryDeckDto } from './deck.dto';
import { SortOrder } from '../../common/enums/sort.enum';

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
            },
        });
    }

    async findById(id: string) {
        return this.prisma.deck.findUnique({
            where: { id },
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
        });
    }

    async findPublicById(id: string) {
        return this.prisma.deck.findFirst({
            where: { id, isBanned: false, isArchived: false, deletedAt: null },
            include: {
                user: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
                _count: { select: { notes: true, cards: true } },
            },
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
                include: {
                    user: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
                    _count: { select: { notes: true, cards: true } },
                },
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
                include: {
                    _count: { select: { notes: true, cards: true } },
                },
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
            }),
            this.prisma.deck.count({ where }),
        ]);

        return { items, total };
    }

    async update(id: string, dto: UpdateDeckDto) {
        return this.prisma.deck.update({
            where: { id },
            data: dto,
        });
    }

    async softDelete(id: string) {
        return this.prisma.deck.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }
}
