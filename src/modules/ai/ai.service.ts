import { Injectable, Inject, Logger } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import { AiProvider } from './providers/ai-provider.interface';
import { AiError } from './ai.error';
import { AI_PROVIDER_TOKEN, AI_CONSTANTS, AI_CLOUDINARY_FOLDER, AI_PROMPTS } from './ai.constant';
import {
    ExtractWordsDto,
    GenerateNotesDto,
    AiNoteDto,
    DetectImageResponseDto,
} from './ai.dto';

@Injectable()
export class AiService {
    private readonly logger = new Logger(AiService.name);

    constructor(@Inject(AI_PROVIDER_TOKEN) private readonly provider: AiProvider) { }

    async extractWords(dto: ExtractWordsDto): Promise<AiNoteDto[]> {
        if (!this.provider.isConfigured()) throw AiError.aiNotConfigured();

        const prompt = `${AI_PROMPTS.FROM_TEXT}\n\nLanguage: ${dto.languageId}\nText: ${dto.text}`;
        const raw = await this.provider.generateText(prompt);
        if (!raw) throw AiError.generationFailed();

        return this.parseJson(raw).notes ?? [];
    }

    async generateNotes(dto: GenerateNotesDto): Promise<AiNoteDto[]> {
        if (!this.provider.isConfigured()) throw AiError.aiNotConfigured();

        const count = dto.count ?? AI_CONSTANTS.DEFAULT_NOTES;
        const prompt = `${AI_PROMPTS.FROM_TOPIC}\n\nTopic: ${dto.topic}\nLanguage: ${dto.languageId}\nCount: ${count}`;
        const raw = await this.provider.generateText(prompt);
        if (!raw) throw AiError.generationFailed();

        return this.parseJson(raw).notes ?? [];
    }

    async detectImage(file: Express.Multer.File): Promise<DetectImageResponseDto> {
        if (!this.provider.isConfigured()) throw AiError.aiNotConfigured();

        const raw = await this.provider.analyzeImage(file.buffer, file.mimetype, AI_PROMPTS.DETECT_IMAGE);
        if (!raw) throw AiError.detectionFailed();

        const objects = this.parseJson(raw).objects ?? [];
        const imageUrl = await this.uploadToCloudinary(file.buffer);

        return { imageUrl, objects };
    }

    private parseJson(text: string): Record<string, any> {
        const cleaned = text
            .trim()
            .replace(/^```(?:json)?\s*/i, '')
            .replace(/```\s*$/i, '')
            .replace(/^[\n\r]+/, '')
            .trim();
        try {
            return JSON.parse(cleaned);
        } catch {
            this.logger.error(`AI returned invalid JSON: ${cleaned.slice(0, 200)}`);
            throw AiError.generationFailed();
        }
    }

    private async uploadToCloudinary(buffer: Buffer): Promise<string> {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { folder: `${AI_CLOUDINARY_FOLDER}/detect`, resource_type: 'image' },
                (err: any, result: any) => {
                    if (err || !result) {
                        reject(err ?? new Error('Upload failed'));
                        return;
                    }
                    resolve(result.secure_url);
                },
            );
            Readable.from(buffer).pipe(uploadStream);
        });
    }
}
