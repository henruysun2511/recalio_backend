import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructures/prisma/prisma.service';
import { Prisma, PartOfSpeech, NoteSourceType } from '@prisma/client';
import { UpdateNoteDto, NoteQueryDto } from './note.dto';
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
  constructor(private readonly prisma: PrismaService) {}

  async countByDeck(deckId: string) {
    return this.prisma.note.count({ where: { deckId, deletedAt: null } });
  }

  async findByDeck(deckId: string, dto: NoteQueryDto) {
    const where: any = { deckId, deletedAt: null };

    if (dto.search) {
      where.OR = [
        { word: { contains: dto.search, mode: 'insensitive' } },
        { meaning: { contains: dto.search, mode: 'insensitive' } },
        { example: { contains: dto.search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.note.findMany({
        where,
        skip: dto.skip,
        take: dto.limit,
        orderBy: { [dto.sort ?? 'createdAt']: dto.sortOrder ?? SortOrder.DESC },
        select: noteSelect,
      }),
      this.prisma.note.count({ where }),
    ]);

    return { items, total };
  }

  async findById(id: string) {
    return this.prisma.note.findUnique({
      where: { id },
      select: noteSelect,
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

  async createBatch(
    userId: string,
    deckId: string,
    items: {
      templateId: string;
      languageId: string;
      word?: string;
      meaning?: string;
      ipa?: string;
      partOfSpeech?: string;
      example?: string;
      audioUrl?: string;
      imageUrl?: string;
      tags?: string[];
      fields?: Record<string, unknown>;
    }[],
    cardTemplateMap: Record<string, string[]>,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const notes = items.map((w) => ({
        id: crypto.randomUUID(),
        userId,
        deckId,
        templateId: w.templateId,
        languageId: w.languageId,
        word: w.word,
        meaning: w.meaning,
        ipa: w.ipa,
        partOfSpeech: w.partOfSpeech,
        example: w.example,
        audioUrl: w.audioUrl ?? null,
        imageUrl: w.imageUrl ?? null,
        tags: w.tags ?? [],
        fields: (w.fields ?? {}) as Prisma.InputJsonValue,
      }));

      await tx.note.createMany({ data: notes as any });

      const cardData = notes.flatMap((n) => {
        const ctIds = cardTemplateMap[n.templateId] ?? [];
        return ctIds.map((ctId) => ({
          id: crypto.randomUUID(),
          userId,
          noteId: n.id,
          cardTemplateId: ctId,
          deckId,
        }));
      });

      if (cardData.length) {
        await tx.card.createMany({ data: cardData });
      }

      return tx.note.findMany({
        where: { id: { in: notes.map((n) => n.id) } },
        select: { id: true, word: true, languageId: true, audioUrl: true },
      });
    });
  }

  async createDocumentNotes(
    userId: string,
    deckId: string,
    templateId: string,
    languageId: string,
    items: {
      word: string;
      meaning: string;
      example: string;
      chunk: string;
      pageNumber?: number | null;
      orderIndex: number;
    }[],
    cardTemplateMap: Record<string, string[]>,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const notes = items.map((item) => ({
        id: crypto.randomUUID(),
        userId,
        deckId,
        templateId,
        languageId,
        word: item.word,
        meaning: item.meaning,
        example: item.example,
        partOfSpeech: PartOfSpeech.PHRASE,
        sourceType: NoteSourceType.DOCUMENT,
        fields: {},
      }));

      await tx.note.createMany({ data: notes as any });

      const documentNoteData = items.map((item, i) => ({
        id: crypto.randomUUID(),
        noteId: notes[i].id,
        chunk: item.chunk,
        pageNumber: item.pageNumber ?? null,
        orderIndex: item.orderIndex,
      }));

      await tx.documentNote.createMany({ data: documentNoteData });

      const ctIds = cardTemplateMap[templateId] ?? [];
      const cardData = notes.map((n) => ({
        id: crypto.randomUUID(),
        userId,
        noteId: n.id,
        cardTemplateId: ctIds[0] ?? '',
        deckId,
      }));

      if (cardData.length && cardData[0].cardTemplateId) {
        await tx.card.createMany({ data: cardData });
      }

      return tx.note.findMany({
        where: { id: { in: notes.map((n) => n.id) } },
        select: { id: true, word: true, languageId: true, audioUrl: true },
      });
    });
  }
}
