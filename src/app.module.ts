import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SharedModule } from './shared/shared.module';
import { CategoriesModule } from './modules/categories/categories.module';

@Module({
  imports: [SharedModule, CategoriesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
