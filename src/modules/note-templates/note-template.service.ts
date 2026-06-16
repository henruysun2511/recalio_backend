import { Injectable } from '@nestjs/common';
import { NoteTemplateRepository } from './note-template.repository';
import { CreateNoteTemplateDto, UpdateNoteTemplateDto, CreateCardTemplateDto, UpdateCardTemplateDto } from './note-template.dto';
import { NoteTemplateError } from './note-template.error';

@Injectable()
export class NoteTemplateService {
    constructor(private readonly repo: NoteTemplateRepository) { }

    async getCardTemplateIds(templateId: string) {
        const template = await this.repo.findById(templateId);
        if (!template) return [];
        return template.cardTemplates.map((ct) => ct.id);
    }

    // ─── Note Template ─────────────────────────────────────

    async create(dto: CreateNoteTemplateDto) {
        const existing = await this.repo.findByName(dto.name);
        if (existing) throw NoteTemplateError.alreadyExists();

        return this.repo.create(dto);
    }

    async findAll() {
        return this.repo.findAll();
    }

    async findById(id: string) {
        const template = await this.repo.findById(id);
        if (!template) throw NoteTemplateError.notFound();
        return template;
    }

    async update(id: string, dto: UpdateNoteTemplateDto) {
        const existing = await this.repo.findById(id);
        if (!existing) throw NoteTemplateError.notFound();

        if (dto.name && dto.name !== existing.name) {
            const duplicate = await this.repo.findByName(dto.name, id);
            if (duplicate) throw NoteTemplateError.alreadyExists();
        }

        return this.repo.update(id, dto);
    }

    async delete(id: string) {
        const existing = await this.repo.findById(id);
        if (!existing) throw NoteTemplateError.notFound();

        await this.repo.delete(id);
    }

    // ─── Card Template ─────────────────────────────────────

    async createCardTemplate(noteTemplateId: string, dto: CreateCardTemplateDto) {
        const template = await this.repo.findById(noteTemplateId);
        if (!template) throw NoteTemplateError.notFound();

        return this.repo.createCardTemplate(noteTemplateId, dto);
    }

    async getCardTemplates(noteTemplateId: string) {
        const template = await this.repo.findById(noteTemplateId);
        if (!template) throw NoteTemplateError.notFound();

        return this.repo.findCardTemplatesByNoteTemplateId(noteTemplateId);
    }

    async getCardTemplateById(noteTemplateId: string, id: string) {
        const template = await this.repo.findById(noteTemplateId);
        if (!template) throw NoteTemplateError.notFound();

        const ct = await this.repo.findCardTemplateById(id);
        if (!ct || ct.noteTemplateId !== noteTemplateId) throw NoteTemplateError.cardTemplateNotFound();

        return ct;
    }

    async updateCardTemplate(noteTemplateId: string, id: string, dto: UpdateCardTemplateDto) {
        const template = await this.repo.findById(noteTemplateId);
        if (!template) throw NoteTemplateError.notFound();

        const ct = await this.repo.findCardTemplateById(id);
        if (!ct || ct.noteTemplateId !== noteTemplateId) throw NoteTemplateError.cardTemplateNotFound();

        return this.repo.updateCardTemplate(id, dto);
    }

    async deleteCardTemplate(noteTemplateId: string, id: string) {
        const template = await this.repo.findById(noteTemplateId);
        if (!template) throw NoteTemplateError.notFound();

        const ct = await this.repo.findCardTemplateById(id);
        if (!ct || ct.noteTemplateId !== noteTemplateId) throw NoteTemplateError.cardTemplateNotFound();

        await this.repo.deleteCardTemplate(id);
    }
}
