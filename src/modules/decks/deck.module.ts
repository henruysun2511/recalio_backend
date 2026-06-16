import { Module } from '@nestjs/common';
import { DeckController } from './deck.controller';
import { DeckService } from './deck.service';
import { DeckRepository } from './deck.repository';

@Module({
    controllers: [DeckController],
    providers: [DeckService, DeckRepository],
    exports: [DeckService, DeckRepository],
})
export class DeckModule { }
