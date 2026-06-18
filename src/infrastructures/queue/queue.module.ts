import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { QueueName } from './queue.constant';
import { NoteAudioProducer } from './producers/note-audio.producer';
import { NotificationProducer } from './producers/notification.producer';

@Module({
    imports: [
        BullModule.registerQueue(
            { name: QueueName.ADD_NOTE },
            { name: QueueName.NOTIFICATION },
        ),
    ],
    providers: [NoteAudioProducer, NotificationProducer],
    exports: [NoteAudioProducer, NotificationProducer],
})
export class QueueModule { }
