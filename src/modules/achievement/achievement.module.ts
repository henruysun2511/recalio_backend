import { Module } from '@nestjs/common';
import { AchievementService } from './achievement.service';
import { AchievementController } from './achievement.controller';
import { AchievementRepository } from './achievement.repository';

@Module({
  controllers: [AchievementController],
  providers: [AchievementService, AchievementRepository],
  exports: [AchievementService],
})
export class AchievementModule {}
