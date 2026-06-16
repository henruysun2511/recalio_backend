import { Module } from '@nestjs/common';
import { DeckSettingController } from './deck-setting.controller';
import { DeckSettingService } from './deck-setting.service';
import { DeckSettingRepository } from './deck-setting.repository';
import { DeckModule } from '../decks/deck.module';

@Module({
    imports: [DeckModule],
    controllers: [DeckSettingController],
    providers: [DeckSettingService, DeckSettingRepository],
    exports: [DeckSettingService],
})
export class DeckSettingModule { }
