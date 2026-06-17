import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../../infrastructures/prisma/prisma.service';
import { AudioCacheService } from '../audio/services/audio-cache.service';
import { DictionaryService } from '../audio/services/dictionary.service';
import { TtsService } from '../audio/services/tts.service';
import { QueueName } from '../../infrastructures/queue/queue.constant';

interface ProcessAudioData {
    noteId: string;
    word: string;
    language: string;
}

@Processor(QueueName.ADD_NOTE)
export class NoteProcessor extends WorkerHost {
    private readonly logger = new Logger(NoteProcessor.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly audioCache: AudioCacheService,
        private readonly dictionary: DictionaryService,
        private readonly tts: TtsService,
    ) {
        super();
    }

    async process(job: Job<ProcessAudioData>) {
        const { noteId, word, language } = job.data;

        try {
            const audioUrl = await this.resolveAudio(word, language);

            if (audioUrl) {
                await this.prisma.note.update({
                    where: { id: noteId },
                    data: { audioUrl },
                });
            }

            this.logger.log(`Audio resolved for note ${noteId}: "${word}" — ${audioUrl ?? 'no audio'}`);
        } catch (err) {
            this.logger.error(`Audio failed for note ${noteId} "${word}": ${(err as Error).message}`);
            throw err;
        }
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

    @OnWorkerEvent('completed')
    onCompleted(job: Job) {
        this.logger.log(`Job ${job.id} completed: "${job.data.word}"`);
    }

    @OnWorkerEvent('failed')
    onFailed(job: Job, err: Error) {
        this.logger.error(`Job ${job.id} failed: "${job.data.word}" — ${err.message}`);
    }
}
