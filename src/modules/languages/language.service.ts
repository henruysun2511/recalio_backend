import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { LanguageRepository } from './language.repository';
import { CreateLanguageDto, UpdateLanguageDto } from './language.dto';
import { LanguageError } from './language.error';

const franc = require('franc');

const ISO6393_TO_6391: Record<string, string> = {
    eng: 'en', vie: 'vi', jpn: 'ja', kor: 'ko', zho: 'zh',
    fra: 'fr', deu: 'de', spa: 'es', por: 'pt', rus: 'ru',
    ara: 'ar', hin: 'hi', tha: 'th', ita: 'it', nld: 'nl',
    pol: 'pl', tur: 'tr', swe: 'sv', dan: 'da', fin: 'fi',
    nor: 'nb', ces: 'cs', hun: 'hu', ron: 'ro', ukr: 'uk',
    ell: 'el', heb: 'he', msA: 'ms', ind: 'id', cmn: 'zh',
};

function detectByChar(text: string): string | null {
    if (/[\u3040-\u309F\u30A0-\u30FF]/.test(text)) return 'ja';
    if (/[\uAC00-\uD7AF]/.test(text)) return 'ko';
    if (/[\u4E00-\u9FFF]/.test(text)) return 'zh';
    if (/[\u0E00-\u0E7F]/.test(text)) return 'th';
    if (/[\u0600-\u06FF]/.test(text)) return 'ar';
    if (/[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(text)) return 'vi';
    return null;
}

@Injectable()
export class LanguageService implements OnApplicationBootstrap {
    private supportedSet = new Set<string>();

    constructor(private readonly repo: LanguageRepository) { }

    async onApplicationBootstrap() {
        await this.refreshSupportedSet();
    }

    private async refreshSupportedSet() {
        const languages = await this.repo.findAllSupported();
        this.supportedSet = new Set(languages.map((l) => l.id));
    }

    isSupported(languageId: string): boolean {
        return this.supportedSet.has(languageId);
    }

    detectLanguage(text: string): string {
        const byChar = detectByChar(text);
        if (byChar) return byChar;

        const result = franc.franc(text, { minLength: 1 });
        if (result && result !== 'und') {
            return ISO6393_TO_6391[result] ?? result;
        }

        return 'und';
    }

    async create(dto: CreateLanguageDto) {
        const existing = await this.repo.findById(dto.id);
        if (existing) throw LanguageError.alreadyExists();

        const result = await this.repo.create(dto);
        await this.refreshSupportedSet();
        return result;
    }

    async findAll() {
        return this.repo.findAll();
    }

    async findAllSupported() {
        return this.repo.findAllSupported();
    }

    async update(id: string, dto: UpdateLanguageDto) {
        const existing = await this.repo.findById(id);
        if (!existing) throw LanguageError.notFound();

        const result = await this.repo.update(id, dto);
        await this.refreshSupportedSet();
        return result;
    }

    async delete(id: string) {
        const existing = await this.repo.findById(id);
        if (!existing) throw LanguageError.notFound();

        await this.repo.delete(id);
        await this.refreshSupportedSet();
    }
}
