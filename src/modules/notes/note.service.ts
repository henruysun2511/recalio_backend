import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { NoteRepository } from './note.repository';
import { UpdateNoteDto, PreviewNoteDto, ConfirmNoteDto } from './note.dto';
import { NoteError } from './note.error';
import { paginate } from '../../common/utils/paginate.util';
import { PaginationDto } from '../../common/dtos/pagination.dto';
import { DeckService } from '../decks/deck.service';
import { NoteTemplateService } from '../note-templates/note-template.service';
import { AudioCacheService } from '../audio/services/audio-cache.service';
import { DictionaryService } from '../audio/services/dictionary.service';
import { TtsService } from '../audio/services/tts.service';
import { LanguageService } from '../languages/language.service';
import { AudioStatus, AudioSource, WordPreviewItem, PreviewSummary } from './note.constant';
import { NoteAudioProducer } from '../../infrastructures/queue/producers/note-audio.producer';
import { NOTE_CONSTANTS } from './note.constant';

@Injectable()
export class NoteService {
    private readonly logger = new Logger(NoteService.name);

    constructor(
        private readonly repo: NoteRepository,
        private readonly deckService: DeckService,
        private readonly noteTemplateService: NoteTemplateService,
        private readonly audioCache: AudioCacheService,
        private readonly dictionary: DictionaryService,
        private readonly tts: TtsService,
        private readonly languageService: LanguageService,
        private readonly noteAudioProducer: NoteAudioProducer,
    ) { }

    async preview(dto: PreviewNoteDto): Promise<{ summary: PreviewSummary; words: WordPreviewItem[] }> {
        const withLang = dto.words.map((item) => {
            const detectedLanguage = item.detectedLanguage ?? this.languageService.detectLanguage(item.word);
            return {
                ...item,
                detectedLanguage,
                isSupported: this.languageService.isSupported(detectedLanguage),
            };
        });

        const needCacheCheck = withLang.filter(
            (item) => item.isSupported && !item.userAudioUrl,
        );

        const cacheMap = await this.audioCache.mget(
            needCacheCheck.map(({ word, detectedLanguage }) => ({
                text: word,
                language: detectedLanguage,
            })),
        );

        const words: WordPreviewItem[] = withLang.map((item) => {
            if (!item.isSupported) {
                return {
                    word: item.word,
                    detectedLanguage: item.detectedLanguage,
                    isSupported: false,
                    audioStatus: AudioStatus.UNSUPPORTED,
                    audioUrl: null,
                    audioSource: null,
                    userAudioUrl: item.userAudioUrl ?? null,
                    willUseCachedAudio: false,
                };
            }

            if (item.userAudioUrl) {
                return {
                    word: item.word,
                    detectedLanguage: item.detectedLanguage,
                    isSupported: true,
                    audioStatus: AudioStatus.USER_PROVIDED,
                    audioUrl: null,
                    audioSource: AudioSource.USER,
                    userAudioUrl: item.userAudioUrl,
                    willUseCachedAudio: false,
                };
            }

            const hashKey = this.audioCache.buildHashKey(item.word, item.detectedLanguage);
            const cachedUrl = cacheMap.get(hashKey) ?? null;

            return {
                word: item.word,
                detectedLanguage: item.detectedLanguage,
                isSupported: true,
                audioStatus: cachedUrl ? AudioStatus.CACHE_HIT : AudioStatus.CACHE_MISS,
                audioUrl: cachedUrl,
                audioSource: cachedUrl ? AudioSource.DICTIONARY : null,
                userAudioUrl: null,
                willUseCachedAudio: !!cachedUrl,
            };
        });

        const summary: PreviewSummary = {
            total: words.length,
            cacheHit: words.filter((w) => w.audioStatus === AudioStatus.CACHE_HIT).length,
            cacheMiss: words.filter((w) => w.audioStatus === AudioStatus.CACHE_MISS).length,
            userAudioProvided: words.filter((w) => w.audioStatus === AudioStatus.USER_PROVIDED).length,
            unsupportedLanguage: words.filter((w) => w.audioStatus === AudioStatus.UNSUPPORTED).length,
        };

        return { summary, words };
    }

    async confirm(dto: ConfirmNoteDto, userId: string) {
        const ownerId = await this.deckService.getOwner(dto.deckId);
        if (!ownerId) throw NoteError.deckNotFound();
        if (ownerId !== userId) throw NoteError.notOwner();

        const invalidWords = dto.words.filter(
            (w) => !this.languageService.isSupported(w.languageId),
        );
        if (invalidWords.length > 0) {
            throw new BadRequestException(
                `Các từ không được hỗ trợ: ${invalidWords.map((w) => w.word).join(', ')}`,
            );
        }

        const toUpdate = dto.words.filter((w) => w.id);
        const toCreate = dto.words.filter((w) => !w.id);

        const createWithoutTemplate = toCreate.filter((w) => !w.templateId);
        if (createWithoutTemplate.length) {
            throw new BadRequestException('templateId là bắt buộc cho từ mới');
        }

        for (const item of toUpdate) {
            const note = await this.repo.findById(item.id!);
            if (!note || note.deckId !== dto.deckId) throw NoteError.notFound();
        }

        if (toCreate.length) {
            const current = await this.repo.countByDeck(dto.deckId);
            if (current + toCreate.length > NOTE_CONSTANTS.NOTES_PER_DECK_MAX) {
                throw NoteError.limitExceeded();
            }
        }

        const cardTemplateMap: Record<string, string[]> = {};
        const createTemplateIds = [...new Set(toCreate.map((w) => w.templateId).filter((tid): tid is string => !!tid))];
        await Promise.all(
            createTemplateIds.map(async (tid) => {
                cardTemplateMap[tid] = await this.noteTemplateService.getCardTemplateIds(tid);
            }),
        );

        for (const item of toUpdate) {
            const updateData: Record<string, unknown> = {};
            if (item.templateId !== undefined) updateData.templateId = item.templateId;
            if (item.languageId !== undefined) updateData.languageId = item.languageId;
            if (item.word !== undefined) updateData.word = item.word;
            if (item.meaning !== undefined) updateData.meaning = item.meaning;
            if (item.ipa !== undefined) updateData.ipa = item.ipa;
            if (item.partOfSpeech !== undefined) updateData.partOfSpeech = item.partOfSpeech;
            if (item.example !== undefined) updateData.example = item.example;
            if (item.audioUrl !== undefined) updateData.audioUrl = item.audioUrl;
            if (item.imageUrl !== undefined) updateData.imageUrl = item.imageUrl;
            if (item.tags !== undefined) updateData.tags = item.tags;
            if (item.fields !== undefined) updateData.fields = item.fields;
            await this.repo.update(item.id!, updateData as any);
        }

        if (dto.words.length === 1 && !dto.words[0].id) {
            const word = dto.words[0];
            const created = await this.repo.createBatch(userId, dto.deckId, [word] as any, cardTemplateMap);
            const note = created[0];
            if (note && !note.audioUrl) {
                const audioUrl = await this.resolveAudio(note.word ?? '', note.languageId);
                if (audioUrl) {
                    await this.repo.update(note.id!, { audioUrl });
                }
            }
            this.logger.log(`User ${userId}: 1 note created inline`);
            return { created: 1, updated: 0, audioJobs: 0 };
        }

        const created = toCreate.length
            ? await this.repo.createBatch(userId, dto.deckId, toCreate as any, cardTemplateMap)
            : [];

        const audioJobs = created.filter((n) => !n.audioUrl);
        if (audioJobs.length) {
            await this.noteAudioProducer.addBulk(
                audioJobs.map((n) => ({ noteId: n.id, word: n.word ?? '', language: n.languageId })),
            );
        }

        this.logger.log(`User ${userId}: ${created.length} created, ${toUpdate.length} updated, ${audioJobs.length} audio jobs`);

        return {
            created: created.length,
            updated: toUpdate.length,
            audioJobs: audioJobs.length,
        };
    }

    private async resolveAudio(word: string, language: string): Promise<string | null> {
        const cached = await this.audioCache.findByTextLanguage(word, language);
        if (cached?.audioUrl) return cached.audioUrl;

        if (language === 'en') {
            const dictUrl = await this.dictionary.fetchAudio(word);
            if (dictUrl) {
                await this.audioCache.save(word, language, dictUrl);
                return dictUrl;
            }
        }

        const ttsUrl = await this.tts.generate(word, language);
        if (ttsUrl) {
            await this.audioCache.save(word, language, ttsUrl);
            return ttsUrl;
        }

        return null;
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
