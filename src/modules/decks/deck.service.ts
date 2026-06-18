import { Injectable, Logger } from '@nestjs/common';
import { DeckRepository } from './deck.repository';
import { CreateDeckDto, UpdateDeckDto, MoveDeckDto, QueryDeckDto } from './deck.dto';
import { DeckError } from './deck.error';
import { DECK_CONSTANTS } from './deck.constant';
import { paginate } from '../../common/utils/paginate.util';
import { NotificationService } from '../notifications/notification.service';
import { NotificationType } from '@prisma/client';

@Injectable()
export class DeckService {
    private readonly logger = new Logger(DeckService.name);

    constructor(
        private readonly repo: DeckRepository,
        private readonly notificationService: NotificationService,
    ) { }

    async getOwner(id: string) {
        const deck = await this.repo.findById(id);
        if (!deck || deck.deletedAt) return null;
        return deck.userId;
    }

    async checkReadAccess(id: string, userId?: string) {
        const deck = await this.repo.findById(id);
        if (!deck || deck.deletedAt || deck.isBanned) return null;
        if (deck.isPublic || deck.userId === userId) return deck.userId;
        return null;
    }

    async create(userId: string, dto: CreateDeckDto) {
        const existing = await this.repo.findByName(userId, dto.name);
        if (existing) throw DeckError.nameTaken(dto.name);

        if (dto.parentId) {
            const depth = await this.repo.findParentDepth(dto.parentId);
            if (depth >= DECK_CONSTANTS.MAX_DEPTH) throw DeckError.maxDepthReached();
        }

        return this.repo.create(userId, dto);
    }

    async getById(id: string, userId?: string) {
        const deck = await this.repo.findById(id);
        if (!deck || deck.deletedAt) throw DeckError.notFound();
        if (deck.isBanned) throw DeckError.notFound();
        if (!deck.isPublic && deck.userId !== userId) throw DeckError.notFound();

        if (deck.userId === userId) {
            return this.repo.findByIdFull(id);
        }
        return this.repo.findPublicById(id);
    }

    async getPublicList(dto: QueryDeckDto) {
        const { items, total } = await this.repo.findPublicDecks(dto);
        return paginate(items, total, dto);
    }

    async getMyList(userId: string, dto: QueryDeckDto) {
        const { items, total } = await this.repo.findMyDecks(userId, dto);
        return paginate(items, total, dto);
    }

    async getArchivedList(userId: string, dto: QueryDeckDto) {
        const { items, total } = await this.repo.findArchivedDecks(userId, dto);
        return paginate(items, total, dto);
    }

    async getClonedList(userId: string, dto: QueryDeckDto) {
        const { items, total } = await this.repo.findClonedDecks(userId, dto);
        return paginate(items, total, dto);
    }

    async update(userId: string, id: string, dto: UpdateDeckDto) {
        const deck = await this.repo.findById(id);
        if (!deck || deck.deletedAt) throw DeckError.notFound();
        if (deck.userId !== userId) throw DeckError.notOwner();

        if (dto.name && dto.name !== deck.name) {
            const existing = await this.repo.findByName(userId, dto.name, id);
            if (existing) throw DeckError.nameTaken(dto.name);
        }

        if (dto.name && !dto.fullPath) {
            dto.fullPath = dto.name;
        }

        return this.repo.update(id, dto);
    }

    async delete(userId: string, id: string) {
        const deck = await this.repo.findById(id);
        if (!deck || deck.deletedAt) throw DeckError.notFound();
        if (deck.userId !== userId) throw DeckError.notOwner();
        return this.repo.softDelete(id);
    }

    async move(userId: string, id: string, dto: MoveDeckDto) {
        const deck = await this.repo.findById(id);
        if (!deck || deck.deletedAt) throw DeckError.notFound();
        if (deck.userId !== userId) throw DeckError.notOwner();

        if (dto.parentId) {
            const depth = await this.repo.findParentDepth(dto.parentId);
            if (depth >= DECK_CONSTANTS.MAX_DEPTH) throw DeckError.maxDepthReached();
        }

        return this.repo.move(id, dto.parentId ?? null);
    }

    async clone(userId: string, id: string) {
        const source = await this.repo.findSourceForClone(id);
        if (!source) throw DeckError.notFound();
        if (source.userId === userId) throw DeckError.cannotCloneOwn();

        const existing = await this.repo.findCloneByUser(userId, id);
        if (existing) throw DeckError.alreadyCloned();

        return this.repo.deepClone(userId, source);
    }

    async toggleBan(id: string) {
        const deck = await this.repo.findById(id);
        if (!deck || deck.deletedAt) throw DeckError.notFound();

        if (deck.isBanned) {
            return this.repo.unban(id);
        }
        const result = await this.repo.ban(id);

        await this.notificationService.notifyUser(
            deck.userId,
            NotificationType.DECK_BANNED,
            'Deck của bạn đã bị cấm',
            `Deck "${deck.name}" đã bị admin khóa vì vi phạm quy định`,
            { deckId: id },
        );
        this.logger.log(`Deck ${id}: notified owner ${deck.userId} about ban`);

        return result;
    }
}
