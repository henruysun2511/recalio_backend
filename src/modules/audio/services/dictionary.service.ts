import { Injectable, Logger } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { AppConfig } from '../../../config/app.config';

const DICTIONARY_API = 'https://api.dictionaryapi.dev/api/v2/entries/en';

@Injectable()
export class DictionaryService {
    private readonly logger = new Logger(DictionaryService.name);

    async fetchAudio(word: string): Promise<string | null> {
        try {
            const res = await fetch(`${DICTIONARY_API}/${encodeURIComponent(word)}`);
            if (!res.ok) return null;

            const entries: any[] = await res.json();
            if (!entries.length) return null;

            const audioUrl = this.findPhoneticAudio(entries);
            if (!audioUrl) return null;

            const bufferRes = await fetch(audioUrl);
            if (!bufferRes.ok) return null;

            const buffer = Buffer.from(await bufferRes.arrayBuffer());
            return this.uploadToCloudinary(buffer, word);
        } catch (err) {
            this.logger.warn(`Dictionary fetch failed for "${word}": ${(err as Error).message}`);
            return null;
        }
    }

    private findPhoneticAudio(entries: any[]): string | null {
        for (const entry of entries) {
            if (entry.phonetics) {
                for (const ph of entry.phonetics) {
                    if (ph.audio) return ph.audio;
                }
            }
        }
        return null;
    }

    private async uploadToCloudinary(buffer: Buffer, word: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: `${AppConfig.CLOUDINARY_AUDIO_FOLDER ?? 'recalio/audio'}/dictionary`,
                    public_id: `${word}_${Date.now()}`,
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
