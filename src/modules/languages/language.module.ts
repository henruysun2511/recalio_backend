import { Module } from '@nestjs/common';
import { LanguageController } from './language.controller';
import { LanguageService } from './language.service';
import { LanguageRepository } from './language.repository';

@Module({
    controllers: [LanguageController],
    providers: [LanguageService, LanguageRepository],
    exports: [LanguageService],
})
export class LanguageModule { }
