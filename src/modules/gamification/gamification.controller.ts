import { Controller, Get, Patch, Query, Body } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { GamificationService } from './gamification.service';
import {
  XpResponseDto,
  AchievementsResponseDto,
  LeaderboardQueryDto,
  LeaderboardUserDto,
  StudyCalendarQueryDto,
  StudyCalendarEntryDto,
  StudyStreakDto,
  ReviewStatsDto,
  DailyGoalDto,
  DailyGoalResponseDto,
} from './gamification.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import { SwaggerDoc } from '../../common/swagger/swagger-doc';

@ApiTags('Gamification')
@ApiBearerAuth()
@Controller('gamification')
export class GamificationController {
  constructor(private readonly service: GamificationService) {}

  @Get('xp')
  @ResponseMessage('Lấy thông tin XP và level')
  @SwaggerDoc({ summary: 'Get XP and level', responseType: XpResponseDto })
  async getXp(
    @CurrentUser('id') currentUserId: string,
    @Query('userId') userId?: string,
  ) {
    return this.service.getXp(userId ?? currentUserId);
  }

  @Get('achievements')
  @ResponseMessage('Lấy danh sách thành tích')
  @SwaggerDoc({
    summary: 'Get achievements',
    responseType: AchievementsResponseDto,
  })
  async getAchievements(
    @CurrentUser('id') currentUserId: string,
    @Query('userId') userId?: string,
  ) {
    return this.service.getAchievements(userId ?? currentUserId);
  }

  @Get('leaderboard')
  @ResponseMessage('Lấy bảng xếp hạng')
  @SwaggerDoc({
    summary: 'Get leaderboard',
    responseType: LeaderboardUserDto,
    isArray: true,
  })
  async getLeaderboard(
    @CurrentUser('id') userId: string,
    @Query() dto: LeaderboardQueryDto,
  ) {
    return this.service.getLeaderboard(userId, dto);
  }

  @Get('calendar')
  @ResponseMessage('Lấy lịch học')
  @SwaggerDoc({
    summary: 'Get study calendar',
    responseType: StudyCalendarEntryDto,
    isArray: true,
  })
  async getStudyCalendar(
    @CurrentUser('id') currentUserId: string,
    @Query() dto: StudyCalendarQueryDto,
  ) {
    return this.service.getStudyCalendar(dto.userId ?? currentUserId, dto);
  }

  @Get('streak')
  @ResponseMessage('Lấy thông tin streak')
  @SwaggerDoc({ summary: 'Get study streak', responseType: StudyStreakDto })
  async getStudyStreak(
    @CurrentUser('id') currentUserId: string,
    @Query('userId') userId?: string,
  ) {
    return this.service.getStudyStreak(userId ?? currentUserId);
  }

  @Get('review-stats')
  @ResponseMessage('Lấy thống kê ôn tập')
  @SwaggerDoc({ summary: 'Get review stats', responseType: ReviewStatsDto })
  async getReviewStats(
    @CurrentUser('id') currentUserId: string,
    @Query('userId') userId?: string,
  ) {
    return this.service.getReviewStats(userId ?? currentUserId);
  }

  @Get('daily-goal')
  @ResponseMessage('Lấy mục tiêu học tập')
  @SwaggerDoc({ summary: 'Get daily goal', responseType: DailyGoalResponseDto })
  async getDailyGoal(@CurrentUser('id') userId: string) {
    return this.service.getDailyGoal(userId);
  }

  @Patch('daily-goal')
  @ResponseMessage('Cập nhật mục tiêu học tập')
  @SwaggerDoc({ summary: 'Update daily goal', bodyType: DailyGoalDto })
  async updateDailyGoal(
    @CurrentUser('id') userId: string,
    @Body() dto: DailyGoalDto,
  ) {
    return this.service.upsertDailyGoal(userId, dto);
  }
}
