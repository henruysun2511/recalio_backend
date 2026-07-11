import { Module } from '@nestjs/common';
import { SuggestionController } from './suggestion.controller';
import { SuggestionService } from './suggestion.service';
import { SuggestionRepository } from './suggestion.repository';
import { NotificationModule } from '../notifications/notification.module';

@Module({
  imports: [NotificationModule],
  controllers: [SuggestionController],
  providers: [SuggestionService, SuggestionRepository],
  exports: [SuggestionService, SuggestionRepository],
})
export class SuggestionModule {}
