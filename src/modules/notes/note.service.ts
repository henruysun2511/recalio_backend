import { Injectable } from '@nestjs/common';
import { NoteRepository } from './note.repository';
import { CreateNoteDto, UpdateNoteDto, BatchUpsertNotesDto, PreviewRequestDto, PreviewResponseDto } from './note.dto';
import { NoteError } from './note.error';
import { paginate } from '../../common/utils/paginate.util';
import { PaginationDto } from '../../common/dtos/pagination.dto';
import { DeckService } from '../decks/deck.service';
import { NoteTemplateService } from '../note-templates/note-template.service';
import { NOTE_CONSTANTS } from './note.constant';
import { detectLanguage } from './language.util';

@Injectable()
export class NoteService {
    constructor(
        private readonly repo: NoteRepository,
        private readonly deckService: DeckService,
        private readonly noteTemplateService: NoteTemplateService,
    ) { }

    async preview(dto: PreviewRequestDto): Promise<PreviewResponseDto> {
        const supportedSet = await this.repo.findSupportedLanguageIds();

        const items = await Promise.all(
            dto.items.map(async (item) => {
                let detectedLanguage = item.languageId ?? detectLanguage(item.text);

                if (!supportedSet.has(detectedLanguage)) {
                    detectedLanguage = 'und';
                }

                const cache = detectedLanguage !== 'und'
                    ? await this.repo.findAudioCache(item.text, detectedLanguage)
                    : null;

                return {
                    text: item.text,
                    detectedLanguage,
                    audioUrl: cache?.audioUrl ?? null,
                };
            }),
        );

        return { items };
    }

    async create(userId: string, deckId: string, dto: CreateNoteDto) {
        const ownerId = await this.deckService.getOwner(deckId);
        if (!ownerId) throw NoteError.deckNotFound();
        if (ownerId !== userId) throw NoteError.notOwner();

        const count = await this.repo.countByDeck(deckId);
        if (count >= NOTE_CONSTANTS.NOTES_PER_DECK_MAX) throw NoteError.limitExceeded();

        const cardTemplateIds = await this.noteTemplateService.getCardTemplateIds(dto.templateId);

        return this.repo.createWithCards(userId, deckId, dto, cardTemplateIds);
    }

    async batchUpsert(userId: string, deckId: string, dto: BatchUpsertNotesDto) {
        const ownerId = await this.deckService.getOwner(deckId);
        if (!ownerId) throw NoteError.deckNotFound();
        if (ownerId !== userId) throw NoteError.notOwner();

        for (const item of dto.notes) {
            if (item.id) {
                const note = await this.repo.findById(item.id);
                if (!note || note.deckId !== deckId) throw NoteError.notFound();
            }
        }

        const newCount = dto.notes.filter((n) => !n.id).length;
        if (newCount) {
            const current = await this.repo.countByDeck(deckId);
            if (current + newCount > NOTE_CONSTANTS.NOTES_PER_DECK_MAX) throw NoteError.limitExceeded();
        }

        const templateIds = [...new Set(dto.notes.map((n) => n.templateId))];
        const cardTemplateMap: Record<string, string[]> = {};
        await Promise.all(
            templateIds.map(async (tid) => {
                cardTemplateMap[tid] = await this.noteTemplateService.getCardTemplateIds(tid);
            }),
        );

        return this.repo.batchUpsert(userId, deckId, dto.notes, cardTemplateMap);
    }

    async findByDeck(userId: string | undefined, deckId: string, dto: PaginationDto) {
        const ownerId = await this.deckService.checkReadAccess(deckId, userId);
        if (!ownerId) throw NoteError.deckNotAccessible();

        const { items, total } = await this.repo.findByDeck(deckId, dto);
        return paginate(items, total, dto);
    }

    async update(userId: string, id: string, dto: UpdateNoteDto) {
        const note = await this.repo.findById(id);
        if (!note) throw NoteError.notFound();

        const ownerId = await this.deckService.getOwner(note.deckId);
        if (!ownerId || ownerId !== userId) throw NoteError.notOwner();

        return this.repo.update(id, dto);
    }

    async delete(userId: string, id: string) {
        const note = await this.repo.findById(id);
        if (!note) throw NoteError.notFound();

        const ownerId = await this.deckService.getOwner(note.deckId);
        if (!ownerId || ownerId !== userId) throw NoteError.notOwner();

        await this.repo.softDelete(id);
    }


}
