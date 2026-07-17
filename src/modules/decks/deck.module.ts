import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { DeckController } from './deck.controller';
import { DeckService } from './deck.service';
import { DeckRepository } from './deck.repository';
import { NotificationModule } from '../notifications/notification.module';
import { CloudinaryModule } from '../../infrastructures/cloudinary/cloudinary.module';

@Module({
  imports: [NotificationModule, CloudinaryModule, MulterModule.register({})],
  controllers: [DeckController],
  providers: [DeckService, DeckRepository],
  exports: [DeckService],
})
export class DeckModule {}
