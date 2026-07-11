import { Module } from '@nestjs/common';
import { StudySessionController } from './study-session.controller';
import { StudySessionService } from './study-session.service';
import { StudySessionRepository } from './study-session.repository';
import { DeckModule } from '../decks/deck.module';

@Module({
  imports: [DeckModule],
  controllers: [StudySessionController],
  providers: [StudySessionService, StudySessionRepository],
  exports: [StudySessionService],
})
export class StudySessionModule {}
