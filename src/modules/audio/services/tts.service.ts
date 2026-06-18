import { Injectable, Logger } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { AppConfig } from '../../../config/app.config';

const GOOGLE_TTS_URL = 'https://translate.google.com/translate_tts';

const LANG_MAP: Record<string, string> = {
    en: 'en', ja: 'ja', ko: 'ko', zh: 'zh-CN',
    vi: 'vi', fr: 'fr', de: 'de', es: 'es',
    pt: 'pt', ru: 'ru', ar: 'ar', hi: 'hi',
    th: 'th', it: 'it', nl: 'nl', pl: 'pl',
    tr: 'tr', sv: 'sv', da: 'da', fi: 'fi',
    nb: 'nb', cs: 'cs', hu: 'hu', ro: 'ro',
    uk: 'uk', el: 'el', he: 'he', ms: 'ms',
    id: 'id',
};

@Injectable()
export class TtsService {
    private readonly logger = new Logger(TtsService.name);

    async generate(text: string, language: string): Promise<string | null> {
        const tl = LANG_MAP[language];
        if (!tl) {
            this.logger.warn(`Unsupported TTS language: ${language}`);
            return null;
        }

        try {
            const url = `${GOOGLE_TTS_URL}?ie=UTF-8&client=tw-ob&tl=${tl}&q=${encodeURIComponent(text)}`;

            const res = await fetch(url);
            if (!res.ok) {
                this.logger.warn(`TTS API returned ${res.status} for "${text}"`);
                return null;
            }

            const buffer = Buffer.from(await res.arrayBuffer());
            return this.uploadToCloudinary(buffer, text);
        } catch (err) {
            this.logger.warn(`TTS failed for "${text}": ${(err as Error).message}`);
            return null;
        }
    }

    private async uploadToCloudinary(buffer: Buffer, text: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: `${AppConfig.CLOUDINARY_AUDIO_FOLDER ?? 'recalio/audio'}/tts`,
                    public_id: `${text.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}`,
                    resource_type: 'video',
                },
                (err, result) => {
                    if (err || !result) {
                        reject(err ?? new Error('Empty upload response'));
                        return;
                    }
                    resolve(result.secure_url);
                },
            );
            const { Readable } = require('stream');
            Readable.from(buffer).pipe(uploadStream);
        });
    }
}
