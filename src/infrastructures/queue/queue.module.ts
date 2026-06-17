import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { QueueName } from './queue.constant';
import { NoteAudioProducer } from './producers/note-audio.producer';

@Module({
    imports: [
        BullModule.registerQueue({ name: QueueName.ADD_NOTE }),
    ],
    providers: [NoteAudioProducer],
    exports: [NoteAudioProducer],
})
export class QueueModule { }
