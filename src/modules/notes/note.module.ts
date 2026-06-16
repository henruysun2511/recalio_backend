import { Module } from '@nestjs/common';
import { NoteController } from './note.controller';
import { NoteService } from './note.service';
import { NoteRepository } from './note.repository';
import { DeckModule } from '../decks/deck.module';

@Module({
    imports: [DeckModule],
    controllers: [NoteController],
    providers: [NoteService, NoteRepository],
    exports: [NoteService],
})
export class NoteModule { }
