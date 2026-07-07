import { Module } from '@nestjs/common';
import { SuggestionController } from './suggestion.controller';
import { SuggestionService } from './suggestion.service';
import { SuggestionRepository } from './suggestion.repository';

@Module({
    controllers: [SuggestionController],
    providers: [SuggestionService, SuggestionRepository],
    exports: [SuggestionService, SuggestionRepository],
})
export class SuggestionModule { }
