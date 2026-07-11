import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructures/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import {
  CreateNoteTemplateDto,
  UpdateNoteTemplateDto,
  CreateCardTemplateDto,
  UpdateCardTemplateDto,
} from './note-template.dto';

const noteTemplateSelect = {
  id: true,
  name: true,
  type: true,
  fieldNames: true,
} satisfies Prisma.NoteTemplateSelect;

const noteTemplateDetailSelect = {
  id: true,
  name: true,
  type: true,
  fieldNames: true,
  cardTemplates: {
    select: {
      id: true,
      noteTemplateId: true,
      name: true,
      frontHtml: true,
      backHtml: true,
      css: true,
    },
    orderBy: { name: 'asc' },
  },
} satisfies Prisma.NoteTemplateSelect;

const cardTemplateSelect = {
  id: true,
  noteTemplateId: true,
  name: true,
  frontHtml: true,
  backHtml: true,
  css: true,
} satisfies Prisma.CardTemplateSelect;

@Injectable()
export class NoteTemplateRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Note Template ─────────────────────────────────────

  async create(dto: CreateNoteTemplateDto) {
    const { cardTemplates, ...data } = dto;
    return this.prisma.noteTemplate.create({
      data: {
        ...data,
        ...(cardTemplates?.length && {
          cardTemplates: {
            create: cardTemplates.map((ct) => ({
              name: ct.name,
              frontHtml: ct.frontHtml,
              backHtml: ct.backHtml,
              css: ct.css ?? '',
            })),
          },
        }),
      },
      select: noteTemplateDetailSelect,
    });
  }

  async findAll() {
    return this.prisma.noteTemplate.findMany({
      orderBy: { name: 'asc' },
      select: noteTemplateSelect,
    });
  }

  async findById(id: string) {
    return this.prisma.noteTemplate.findUnique({
      where: { id },
      select: noteTemplateDetailSelect,
    });
  }

  async findByName(name: string, excludeId?: string) {
    return this.prisma.noteTemplate.findFirst({
      where: {
        name,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
      select: { id: true },
    });
  }

  async update(id: string, dto: UpdateNoteTemplateDto) {
    return this.prisma.noteTemplate.update({
      where: { id },
      data: dto,
      select: noteTemplateDetailSelect,
    });
  }

  async delete(id: string) {
    return this.prisma.noteTemplate.delete({ where: { id } });
  }

  // ─── Card Template ─────────────────────────────────────

  async createCardTemplate(noteTemplateId: string, dto: CreateCardTemplateDto) {
    return this.prisma.cardTemplate.create({
      data: {
        noteTemplateId,
        name: dto.name,
        frontHtml: dto.frontHtml,
        backHtml: dto.backHtml,
        css: dto.css ?? '',
      },
      select: cardTemplateSelect,
    });
  }

  async findCardTemplateById(id: string) {
    return this.prisma.cardTemplate.findUnique({
      where: { id },
      select: cardTemplateSelect,
    });
  }

  async findCardTemplatesByNoteTemplateId(noteTemplateId: string) {
    return this.prisma.cardTemplate.findMany({
      where: { noteTemplateId },
      orderBy: { name: 'asc' },
      select: cardTemplateSelect,
    });
  }

  async updateCardTemplate(id: string, dto: UpdateCardTemplateDto) {
    return this.prisma.cardTemplate.update({
      where: { id },
      data: dto,
      select: cardTemplateSelect,
    });
  }

  async deleteCardTemplate(id: string) {
    return this.prisma.cardTemplate.delete({ where: { id } });
  }
}
