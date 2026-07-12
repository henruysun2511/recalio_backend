import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { NoteRepository } from './note.repository';
import {
  UpdateNoteDto,
  PreviewNoteDto,
  ConfirmNoteDto,
  CreateDocumentNotesDto,
  NoteQueryDto,
} from './note.dto';
import { NoteError } from './note.error';
import { paginate } from '../../common/utils/paginate.util';
import { DeckService } from '../decks/deck.service';
import { NoteTemplateService } from '../note-templates/note-template.service';
import { AudioCacheService } from '../audio/services/audio-cache.service';
import { DictionaryService } from '../audio/services/dictionary.service';
import { TtsService } from '../audio/services/tts.service';
import { LanguageService } from '../languages/language.service';
import {
  AudioStatus,
  AudioSource,
  WordPreviewItem,
  PreviewSummary,
  CLOZE_MARKER_REGEX,
} from './note.constant';
import { NoteAudioProducer } from '../../infrastructures/queue/producers/note-audio.producer';
import { NOTE_CONSTANTS } from './note.constant';
import { PrismaService } from '../../infrastructures/prisma/prisma.service';

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
    private readonly prisma: PrismaService,
  ) {}

  async preview(
    dto: PreviewNoteDto,
  ): Promise<{ summary: PreviewSummary; words: WordPreviewItem[] }> {
    const withLang = dto.words.map((item) => {
      const detectedLanguage =
        item.detectedLanguage ?? this.languageService.detectLanguage(item.word);
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

      const hashKey = this.audioCache.buildHashKey(
        item.word,
        item.detectedLanguage,
      );
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
      cacheHit: words.filter((w) => w.audioStatus === AudioStatus.CACHE_HIT)
        .length,
      cacheMiss: words.filter((w) => w.audioStatus === AudioStatus.CACHE_MISS)
        .length,
      userAudioProvided: words.filter(
        (w) => w.audioStatus === AudioStatus.USER_PROVIDED,
      ).length,
      unsupportedLanguage: words.filter(
        (w) => w.audioStatus === AudioStatus.UNSUPPORTED,
      ).length,
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
    const createTemplateIds = [
      ...new Set(
        toCreate.map((w) => w.templateId).filter((tid): tid is string => !!tid),
      ),
    ];
    await Promise.all(
      createTemplateIds.map(async (tid) => {
        cardTemplateMap[tid] =
          await this.noteTemplateService.getCardTemplateIds(tid);
      }),
    );

    // Lấy type của từng template để xử lý variantIndices
    const templateInfos = await Promise.all(
      createTemplateIds.map((tid) => this.noteTemplateService.findById(tid)),
    );
    const templateTypeMap = new Map(templateInfos.map((t) => [t.id, t.type]));

    // Validate + tính variantIndices cho từng word cần tạo
    const itemsWithVariants = toCreate.map((w) => {
      const type = templateTypeMap.get(w.templateId!);
      if (type === 'CLOZE') {
        const text = (w.fields?.Text as string) ?? '';
        const indices = this.extractClozeIndices(text);
        if (indices.length === 0) throw NoteError.invalidClozeSyntax();
        return { ...w, variantIndices: indices };
      }
      if (type === 'IMAGE_OCCLUSION') {
        if (!w.masks || w.masks.length === 0) throw NoteError.invalidOcclusionMasks();
        const indices = [...new Set(w.masks.map((m) => m.groupIndex))].sort((a, b) => a - b);
        return { ...w, variantIndices: indices };
      }
      return { ...w, variantIndices: null };
    });

    for (const item of toUpdate) {
      const updateData: Record<string, unknown> = {};
      if (item.templateId !== undefined)
        updateData.templateId = item.templateId;
      if (item.languageId !== undefined)
        updateData.languageId = item.languageId;
      if (item.word !== undefined) updateData.word = item.word;
      if (item.meaning !== undefined) updateData.meaning = item.meaning;
      if (item.ipa !== undefined) updateData.ipa = item.ipa;
      if (item.partOfSpeech !== undefined)
        updateData.partOfSpeech = item.partOfSpeech;
      if (item.example !== undefined) updateData.example = item.example;
      if (item.audioUrl !== undefined) updateData.audioUrl = item.audioUrl;
      if (item.imageUrl !== undefined) updateData.imageUrl = item.imageUrl;
      if (item.tags !== undefined) updateData.tags = item.tags;
      if (item.fields !== undefined) updateData.fields = item.fields;
      await this.repo.update(item.id!, updateData);
    }

    if (dto.words.length === 1 && !dto.words[0].id) {
      const word = itemsWithVariants[0];
      const created = await this.repo.createBatch(
        userId,
        dto.deckId,
        [word] as any,
        cardTemplateMap,
      );
      const note = created[0];
      if (note && note.word && !note.audioUrl) {
        const audioUrl = await this.resolveAudio(
          note.word ?? '',
          note.languageId,
        );
        if (audioUrl) {
          await this.repo.update(note.id, { audioUrl });
        }
      }
      await this.syncUserLanguages(userId, [note.languageId]);
      this.logger.log(`User ${userId}: 1 note created inline`);
      return { created: 1, updated: 0, audioJobs: 0 };
    }

    const created = toCreate.length
      ? await this.repo.createBatch(
          userId,
          dto.deckId,
          itemsWithVariants as any,
          cardTemplateMap,
        )
      : [];

    // Bug fix: không sinh audio job cho Cloze/Occlusion (không có word)
    const audioJobs = created.filter((n) => {
      if (!n.word) return false;
      return !n.audioUrl;
    });
    if (audioJobs.length) {
      await this.noteAudioProducer.addBulk(
        audioJobs.map((n) => ({
          noteId: n.id,
          word: n.word ?? '',
          language: n.languageId,
        })),
      );
    }

    if (created.length) {
      await this.syncUserLanguages(
        userId,
        created.map((n) => n.languageId),
      );
    }

    this.logger.log(
      `User ${userId}: ${created.length} created, ${toUpdate.length} updated, ${audioJobs.length} audio jobs`,
    );

    return {
      created: created.length,
      updated: toUpdate.length,
      audioJobs: audioJobs.length,
    };
  }

  private extractClozeIndices(text: string): number[] {
    const indices = new Set<number>();
    let match;
    const regex = new RegExp(CLOZE_MARKER_REGEX);
    while ((match = regex.exec(text)) !== null) {
      indices.add(Number(match[1]));
    }
    return [...indices].sort((a, b) => a - b);
  }

  private async syncUserLanguages(userId: string, languageIds: string[]) {
    const uniqueIds = [...new Set(languageIds)];
    await Promise.all(
      uniqueIds.map((languageId) =>
        this.prisma.userLanguage.upsert({
          where: { userId_languageId: { userId, languageId } },
          update: {},
          create: { userId, languageId, isActive: true },
        }),
      ),
    );
  }

  private async resolveAudio(
    word: string,
    language: string,
  ): Promise<string | null> {
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

  async findByDeck(userId: string, deckId: string, dto: NoteQueryDto) {
    const ownerId = await this.deckService.checkReadAccess(deckId, userId);
    if (!ownerId) throw NoteError.deckNotAccessible();

    const { items, total } = await this.repo.findByDeck(deckId, dto);
    const mapped = items.map((item: any) => ({
      ...item,
      templateType: item.template?.type ?? null,
      occlusionMasks: item.occlusionMasks ?? [],
      template: undefined,
    }));
    return paginate(mapped, total, dto);
  }

  async update(userId: string, id: string, dto: UpdateNoteDto) {
    const note = await this.repo.findById(id);
    if (!note) throw NoteError.notFound();

    const ownerId = await this.deckService.getOwner(note.deckId);
    if (!ownerId || ownerId !== userId) throw NoteError.notOwner();

    return this.repo.update(id, dto);
  }

  async createDocumentNotes(userId: string, dto: CreateDocumentNotesDto) {
    const ownerId = await this.deckService.getOwner(dto.deckId);
    if (!ownerId) throw NoteError.deckNotFound();
    if (ownerId !== userId) throw NoteError.notOwner();

    const cardTemplateIds = await this.noteTemplateService.getCardTemplateIds(
      dto.templateId,
    );
    const cardTemplateMap: Record<string, string[]> = {
      [dto.templateId]: cardTemplateIds,
    };

    const created = await this.repo.createDocumentNotes(
      userId,
      dto.deckId,
      dto.templateId,
      dto.languageId,
      dto.items,
      cardTemplateMap,
    );
    if (created.length) {
      await this.syncUserLanguages(userId, [dto.languageId]);
    }
    return { created: created.length };
  }

  async delete(userId: string, id: string) {
    const note = await this.repo.findById(id);
    if (!note) throw NoteError.notFound();

    const ownerId = await this.deckService.getOwner(note.deckId);
    if (!ownerId || ownerId !== userId) throw NoteError.notOwner();

    await this.repo.softDelete(id);
  }
}
