import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SharedModule } from './shared/shared.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/users/user.module';
import { DeckModule } from './modules/decks/deck.module';

@Module({
    imports: [SharedModule, AuthModule, UserModule, DeckModule],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule { }
