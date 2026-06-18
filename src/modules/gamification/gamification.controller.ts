import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { GamificationService } from './gamification.service';
import { XpResponseDto, AchievementsResponseDto, LeaderboardQueryDto, LeaderboardUserDto } from './gamification.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import { SwaggerDoc } from '../../common/swagger/swagger-doc';

@ApiTags('Gamification')
@ApiBearerAuth()
@Controller('gamification')
export class GamificationController {
    constructor(private readonly service: GamificationService) { }

    @Get('xp')
    @ResponseMessage('Lấy thông tin XP và level')
    @SwaggerDoc({ summary: 'Get XP and level', responseType: XpResponseDto })
    async getXp(@CurrentUser('id') userId: string) {
        return this.service.getXp(userId);
    }

    @Get('achievements')
    @ResponseMessage('Lấy danh sách thành tích')
    @SwaggerDoc({ summary: 'Get achievements', responseType: AchievementsResponseDto })
    async getAchievements(@CurrentUser('id') userId: string) {
        return this.service.getAchievements(userId);
    }

    @Get('leaderboard')
    @ResponseMessage('Lấy bảng xếp hạng')
    @SwaggerDoc({ summary: 'Get leaderboard', responseType: LeaderboardUserDto, isArray: true })
    async getLeaderboard(@CurrentUser('id') userId: string, @Query() dto: LeaderboardQueryDto) {
        return this.service.getLeaderboard(userId, dto);
    }
}
