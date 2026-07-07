import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ScheduleModule } from '@nestjs/schedule';
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
import { CardModule } from './modules/cards/card.module';
import { StudySessionModule } from './modules/study-sessions/study-session.module';
import { NotificationModule } from './modules/notifications/notification.module';
import { GamificationModule } from './modules/gamification/gamification.module';
import { AiModule } from './modules/ai/ai.module';
import { PostModule } from './modules/posts/post.module';
import { PostCommentModule } from './modules/post-comments/post-comment.module';
import { SuggestionModule } from './modules/suggestions/suggestion.module';
import { defaultQueueOptions } from './config/queue.config';
import { CloudinaryModule } from './infrastructures/cloudinary/cloudinary.module';

@Module({
    imports: [
        SharedModule,
        ScheduleModule.forRoot(),
        BullModule.forRoot(defaultQueueOptions),
        AuthModule,
        UserModule,
        DeckModule,
        FollowModule,
        ReportModule,
        ReviewModule,
        LanguageModule,
        NoteTemplateModule,
        DeckSettingModule,
        NoteModule,
        CardModule,
        StudySessionModule,
        NotificationModule,
        GamificationModule,
        AiModule,
        PostModule,
        PostCommentModule,
        SuggestionModule,
        CloudinaryModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule { }
