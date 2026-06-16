import { Injectable } from '@nestjs/common';
import { DeckSettingRepository } from './deck-setting.repository';
import { UpdateDeckSettingDto } from './deck-setting.dto';
import { DeckSettingError } from './deck-setting.error';
import { DeckService } from '../decks/deck.service';

@Injectable()
export class DeckSettingService {
    constructor(
        private readonly repo: DeckSettingRepository,
        private readonly deckService: DeckService,
    ) { }

    async get(userId: string, deckId: string) {
        const ownerId = await this.deckService.getOwner(deckId);
        if (!ownerId) throw DeckSettingError.notFound();
        if (ownerId !== userId) throw DeckSettingError.notOwner();

        const setting = await this.repo.findByDeckId(deckId);
        if (!setting) throw DeckSettingError.notFound();

        return setting;
    }

    async update(userId: string, deckId: string, dto: UpdateDeckSettingDto) {
        const ownerId = await this.deckService.getOwner(deckId);
        if (!ownerId) throw DeckSettingError.notFound();
        if (ownerId !== userId) throw DeckSettingError.notOwner();

        const setting = await this.repo.findByDeckId(deckId);
        if (!setting) throw DeckSettingError.notFound();

        return this.repo.update(deckId, dto);
    }
}
