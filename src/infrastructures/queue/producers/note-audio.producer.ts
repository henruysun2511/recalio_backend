import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { QueueName, JobName } from '../queue.constant';

@Injectable()
export class NoteAudioProducer {
    constructor(@InjectQueue(QueueName.ADD_NOTE) private readonly queue: Queue) { }

    async addJob(noteId: string, word: string, language: string) {
        return this.queue.add(JobName.PROCESS_WORD, { noteId, word, language }, {
            attempts: 3,
            backoff: { type: 'exponential', delay: 2000 },
            removeOnComplete: { count: 1000 },
            removeOnFail: { count: 5000 },
        });
    }

    async addBulk(jobs: { noteId: string; word: string; language: string }[]) {
        return this.queue.addBulk(
            jobs.map((data) => ({
                name: JobName.PROCESS_WORD,
                data,
                opts: {
                    attempts: 3,
                    backoff: { type: 'exponential', delay: 2000 },
                    removeOnComplete: { count: 1000 },
                    removeOnFail: { count: 5000 },
                },
            })),
        );
    }
}
