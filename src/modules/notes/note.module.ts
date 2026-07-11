import { Module } from '@nestjs/common';
import { NoteController } from './note.controller';
import { NoteService } from './note.service';
import { NoteRepository } from './note.repository';
import { DeckModule } from '../decks/deck.module';
import { NoteTemplateModule } from '../note-templates/note-template.module';
import { AudioModule } from '../audio/audio.module';
import { LanguageModule } from '../languages/language.module';
import { QueueModule } from '../../infrastructures/queue/queue.module';
import { NoteProcessor } from './note.processor';

@Module({
  imports: [
    DeckModule,
    NoteTemplateModule,
    AudioModule,
    LanguageModule,
    QueueModule,
  ],
  controllers: [NoteController],
  providers: [NoteService, NoteRepository, NoteProcessor],
  exports: [NoteService],
})
export class NoteModule {}
