import { Injectable } from '@nestjs/common';
import { DeckRepository } from './deck.repository';
import { CreateDeckDto, UpdateDeckDto, QueryDeckDto } from './deck.dto';
import { DeckError } from './deck.error';
import { paginate } from '../../common/utils/paginate.util';

@Injectable()
export class DeckService {
    constructor(private readonly repo: DeckRepository) { }

    async create(userId: string, dto: CreateDeckDto) {
        const existing = await this.repo.findByName(userId, dto.name);
        if (existing) throw DeckError.nameTaken(dto.name);
        return this.repo.create(userId, dto);
    }

    async getById(id: string) {
        const deck = await this.repo.findPublicById(id);
        if (!deck) throw DeckError.notFound();
        return deck;
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
}
