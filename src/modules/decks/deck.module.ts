import { Module } from '@nestjs/common';
import { DeckController } from './deck.controller';
import { DeckService } from './deck.service';
import { DeckRepository } from './deck.repository';
import { NotificationModule } from '../notifications/notification.module';

@Module({
  imports: [NotificationModule],
  controllers: [DeckController],
  providers: [DeckService, DeckRepository],
  exports: [DeckService],
})
export class DeckModule {}
