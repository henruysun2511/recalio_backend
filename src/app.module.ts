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

@Module({
    imports: [SharedModule, AuthModule, UserModule, DeckModule, FollowModule, ReportModule, ReviewModule],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule { }
