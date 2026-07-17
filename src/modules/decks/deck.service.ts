import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { DeckRepository } from './deck.repository';
import {
  CreateDeckDto,
  UpdateDeckDto,
  QueryDeckDto,
} from './deck.dto';
import { DeckError } from './deck.error';
import { DECK_CONSTANTS } from './deck.constant';
import { paginate } from '../../common/utils/paginate.util';
import { NotificationService } from '../notifications/notification.service';
import { CloudinaryService } from '../../infrastructures/cloudinary/cloudinary.service';
import { NotificationType, NoteTemplateType } from '@prisma/client';
import AdmZip from 'adm-zip';
import { Response } from 'express';
import * as crypto from 'node:crypto';

@Injectable()
export class DeckService {
  private readonly logger = new Logger(DeckService.name);

  constructor(
    private readonly repo: DeckRepository,
    private readonly notificationService: NotificationService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

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

    async getFeaturedList(dto: QueryDeckDto) {
        const { items, total } = await this.repo.findFeaturedDecks(dto);
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

  async clone(userId: string, id: string) {
    const source = await this.repo.findSourceForClone(id);
    if (!source) throw DeckError.notFound();
    if (source.userId === userId) throw DeckError.cannotCloneOwn();

    const existing = await this.repo.findCloneByUser(userId, id);
    if (existing) throw DeckError.alreadyCloned();

    return this.repo.deepClone(userId, source);
  }

  async toggleArchive(userId: string, id: string) {
    const deck = await this.repo.findById(id);
    if (!deck || deck.deletedAt) throw DeckError.notFound();
    if (deck.userId !== userId) throw DeckError.notOwner();
    return this.repo.toggleArchive(id);
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

  async toggleFeatured(id: string) {
    const deck = await this.repo.findById(id);
    if (!deck || deck.deletedAt) throw DeckError.notFound();
    return this.repo.toggleFeatured(id);
  }

  async exportDeck(id: string, userId: string, includeMedia: boolean, res: Response) {
    const owner = await this.repo.findById(id);
    if (!owner || owner.deletedAt || owner.isBanned) throw DeckError.notFound();
    if (owner.userId !== userId && !owner.isPublic) throw DeckError.notFound();

    const data = await this.repo.findFullExportData(id);
    if (!data) throw DeckError.notFound();

    const zip = new AdmZip();
    const manifest = { version: 1, app: 'Recalio', exportedAt: new Date().toISOString(), deckName: data.name, mediaCount: 0 };
    const exportData: any = { deck: {}, setting: null, templateMappings: [], notes: [] };

    exportData.deck = {
      name: data.name,
      fullPath: data.fullPath,
      description: data.description,
      coverImage: data.coverImage,
      tags: data.tags,
    };

    if (data.coverImage?.startsWith('http') && includeMedia) {
      const ext = this.extractExt(data.coverImage);
      const name = `media/cover${ext}`;
      exportData.deck.coverImage = name;
      try {
        const buf = await this.downloadFile(data.coverImage);
        zip.addFile(name, buf);
      } catch { exportData.deck.coverImage = data.coverImage; }
    }

    if (data.setting) exportData.setting = data.setting;

    const seenTypes = new Set<string>();
    let mediaIndex = 0;

    for (const note of data.notes) {
      if (!seenTypes.has(note.template.type)) {
        seenTypes.add(note.template.type);
        exportData.templateMappings.push({
          templateType: note.template.type,
          fieldNames: note.template.fieldNames,
          cardTemplates: note.cards.map((c) => ({
            name: c.cardTemplate.name,
            frontHtml: c.cardTemplate.frontHtml,
            backHtml: c.cardTemplate.backHtml,
            css: c.cardTemplate.css,
          })),
        });
      }

      const noteEntry: any = {
        templateType: note.template.type,
        languageId: note.languageId,
        fields: { ...((note.fields as Record<string, unknown>) ?? {}) },
        audioUrl: null,
        imageUrl: null,
        tags: note.tags,
        cards: note.cards.map((c) => ({ cardTemplateName: c.cardTemplate.name, variantIndex: c.variantIndex })),
        masks: note.occlusionMasks.map((m) => ({ x: m.x, y: m.y, width: m.width, height: m.height, groupIndex: m.groupIndex, label: m.label })),
      };

      if (note.word) noteEntry.fields.Word = note.word;
      if (note.meaning) noteEntry.fields.Meaning = note.meaning;
      if (note.ipa) noteEntry.fields.IPA = note.ipa;
      if (note.partOfSpeech) noteEntry.fields.PartOfSpeech = note.partOfSpeech;
      if (note.example) noteEntry.fields.Example = note.example;

      if (note.audioUrl?.startsWith('http')) {
        if (includeMedia) {
          const ext = this.extractExt(note.audioUrl);
          const name = `media/${mediaIndex}${ext}`;
          mediaIndex++;
          noteEntry.audioUrl = name;
          try {
            const buf = await this.downloadFile(note.audioUrl);
            zip.addFile(name, buf);
          } catch { noteEntry.audioUrl = note.audioUrl; }
        } else {
          noteEntry.audioUrl = note.audioUrl;
        }
      } else {
        noteEntry.audioUrl = note.audioUrl;
      }

      if (note.imageUrl?.startsWith('http')) {
        if (includeMedia) {
          const ext = this.extractExt(note.imageUrl);
          const name = `media/${mediaIndex}${ext}`;
          mediaIndex++;
          noteEntry.imageUrl = name;
          try {
            const buf = await this.downloadFile(note.imageUrl);
            zip.addFile(name, buf);
          } catch { noteEntry.imageUrl = note.imageUrl; }
        } else {
          noteEntry.imageUrl = note.imageUrl;
        }
      } else {
        noteEntry.imageUrl = note.imageUrl;
      }

      exportData.notes.push(noteEntry);
    }

    manifest.mediaCount = mediaIndex;

    zip.addFile('manifest.json', Buffer.from(JSON.stringify(manifest, null, 2)));
    zip.addFile('deck.json', Buffer.from(JSON.stringify(exportData, null, 2)));

    const filename = `${data.name.replace(/[^a-zA-Z0-9-_]/g, '_').replace(/ /g, '_')}.rcl`;
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(zip.toBuffer());
  }

  async importDeck(userId: string, file: Express.Multer.File) {
    const zip = new AdmZip(file.buffer);
    const manifestEntry = zip.getEntry('manifest.json');
    const deckEntry = zip.getEntry('deck.json');
    if (!manifestEntry || !deckEntry) throw new BadRequestException('Invalid .rcl file: missing manifest.json or deck.json');

    const manifest = JSON.parse(manifestEntry.getData().toString());
    if (manifest.version !== 1) throw new BadRequestException('Unsupported .rcl version');

    const importData = JSON.parse(deckEntry.getData().toString());

    const deckInfo: any = { ...importData.deck };
    let settingData = importData.setting ? { ...importData.setting } : undefined;

    if (deckInfo.coverImage?.startsWith('media/')) {
      const entry = zip.getEntry(deckInfo.coverImage);
      if (entry) {
        const buf = entry.getData();
        const ext = deckInfo.coverImage.split('.').pop()?.toLowerCase() || 'jpg';
        const mimeMap: Record<string, string> = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', gif: 'image/gif' };
        const uploaded = await this.cloudinaryService.uploadMedia({ buffer: buf, mimetype: mimeMap[ext] || 'image/jpeg' });
        deckInfo.coverImage = uploaded.secure_url;
      }
    }

    const templateTypes = [...new Set(importData.notes.map((n: any) => n.templateType))] as NoteTemplateType[];
    const templates = await this.repo.findNoteTemplatesByTypes(templateTypes);
    const templateMap = new Map(templates.map((t) => [t.type, t]));

    const notesData: any[] = [];
    const cardsData: any[] = [];
    const masksData: any[] = [];
    const oldNoteId = crypto.randomUUID();

    for (const note of importData.notes) {
      const newNoteId = crypto.randomUUID();
      const template = templateMap.get(note.templateType);
      if (!template) continue;

      let audioUrl = note.audioUrl;
      let imageUrl = note.imageUrl;

      if (audioUrl?.startsWith('media/')) {
        const entry = zip.getEntry(audioUrl);
        if (entry) {
          const buf = entry.getData();
          const mimetype = audioUrl.endsWith('.mp3') ? 'audio/mpeg' : 'audio/ogg';
          const uploaded = await this.cloudinaryService.uploadMedia({ buffer: buf, mimetype });
          audioUrl = uploaded.secure_url;
        }
      }

      if (imageUrl?.startsWith('media/')) {
        const entry = zip.getEntry(imageUrl);
        if (entry) {
          const buf = entry.getData();
          const ext = imageUrl.split('.').pop()?.toLowerCase() || 'jpg';
          const mimeMap: Record<string, string> = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', gif: 'image/gif' };
          const uploaded = await this.cloudinaryService.uploadMedia({ buffer: buf, mimetype: mimeMap[ext] || 'image/jpeg' });
          imageUrl = uploaded.secure_url;
        }
      }

      const fields = note.fields || {};
      notesData.push({
        id: newNoteId,
        userId,
        deckId: null as any,
        templateId: template.id,
        languageId: note.languageId || 'en',
        word: fields.Word || null,
        meaning: fields.Meaning || null,
        ipa: fields.IPA || null,
        partOfSpeech: fields.PartOfSpeech || null,
        example: fields.Example || null,
        audioUrl,
        imageUrl,
        tags: note.tags || [],
        fields,
        sourceType: 'MANUAL',
      });

      const templateCardMap = new Map(template.cardTemplates.map((ct) => [ct.name, ct]));
      for (const card of note.cards) {
        const cardTemplate = templateCardMap.get(card.cardTemplateName);
        if (!cardTemplate) continue;
        cardsData.push({
          id: crypto.randomUUID(),
          userId,
          noteId: newNoteId,
          cardTemplateId: cardTemplate.id,
          deckId: null as any,
          variantIndex: card.variantIndex ?? null,
          state: 'NEW',
          due: new Date(),
          interval: 0,
          easeFactor: 2.5,
          repetitions: 0,
          lapses: 0,
          currentStep: 0,
        });
      }

      for (const mask of note.masks || []) {
        masksData.push({
          id: crypto.randomUUID(),
          noteId: newNoteId,
          x: mask.x,
          y: mask.y,
          width: mask.width,
          height: mask.height,
          groupIndex: mask.groupIndex,
          label: mask.label ?? null,
        });
      }
    }

    const deckId = crypto.randomUUID();
    notesData.forEach((n) => { n.deckId = deckId; });
    cardsData.forEach((c) => { c.deckId = deckId; });

    const result = await this.repo.createFullImport(
      userId,
      { ...deckInfo, setting: settingData },
      notesData,
      cardsData,
      masksData,
    );

    return { ...result, notesCount: notesData.length, cardsCount: cardsData.length };
  }

  private extractExt(url: string): string {
    try { const p = new URL(url); const path = p.pathname; const dot = path.lastIndexOf('.'); return dot >= 0 ? path.slice(dot) : ''; }
    catch { return ''; }
  }

  private async downloadFile(url: string): Promise<Buffer> {
    const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
    const buf = await res.arrayBuffer();
    return Buffer.from(buf);
  }
}
