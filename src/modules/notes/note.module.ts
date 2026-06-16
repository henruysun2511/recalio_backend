import { Module } from '@nestjs/common';
import { NoteController } from './note.controller';
import { NoteService } from './note.service';
import { NoteRepository } from './note.repository';
import { DeckModule } from '../decks/deck.module';
import { NoteTemplateModule } from '../note-templates/note-template.module';

@Module({
    imports: [DeckModule, NoteTemplateModule],
    controllers: [NoteController],
    providers: [NoteService, NoteRepository],
    exports: [NoteService],
})
export class NoteModule { }
