import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SharedModule } from './shared/shared.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/users/user.module';
import { DeckModule } from './modules/decks/deck.module';
import { FollowModule } from './modules/follows/follow.module';
import { ReportModule } from './modules/reports/report.module';
import { ReviewModule } from './modules/reviews/review.module';
import { LanguageModule } from './modules/languages/language.module';
import { NoteTemplateModule } from './modules/note-templates/note-template.module';
import { DeckSettingModule } from './modules/deck-settings/deck-setting.module';
import { NoteModule } from './modules/notes/note.module';
import { PreviewModule } from './modules/preview/preview.module';

@Module({
    imports: [SharedModule, AuthModule, UserModule, DeckModule, FollowModule, ReportModule, ReviewModule, LanguageModule, NoteTemplateModule, DeckSettingModule, NoteModule, PreviewModule],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule { }
