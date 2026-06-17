import { Module } from '@nestjs/common';
import { CardController } from './card.controller';
import { CardService } from './card.service';
import { CardRepository } from './card.repository';
import { DeckModule } from '../decks/deck.module';

@Module({
    imports: [DeckModule],
    controllers: [CardController],
    providers: [CardService, CardRepository],
    exports: [CardService],
})
export class CardModule { }
