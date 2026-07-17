import { Module } from '@nestjs/common';
import { CardController } from './card.controller';
import { CardService } from './card.service';
import { CardRepository } from './card.repository';
import { DeckModule } from '../decks/deck.module';
import { GamificationModule } from '../gamification/gamification.module';
import { StudySessionModule } from '../study-sessions/study-session.module';

@Module({
  imports: [DeckModule, GamificationModule, StudySessionModule],
  controllers: [CardController],
  providers: [CardService, CardRepository],
  exports: [CardService],
})
export class CardModule {}
