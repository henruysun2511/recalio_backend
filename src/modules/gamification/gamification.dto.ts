import { IsOptional, IsInt, Min, Max, IsString, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { GAMIFICATION_CONSTANTS } from './gamification.constant';

export class XpResponseDto {
    @ApiProperty({ example: 4750 })
    totalXP: number;

    @ApiProperty({ example: 10 })
    level: number;

    @ApiProperty({ example: 250 })
    currentLevelXP: number;

    @ApiProperty({ example: 1000 })
    nextLevelXP: number;

    @ApiProperty({ example: 25 })
    progressPercent: number;
}

export class AchievementProgressDto {
    @ApiProperty({ example: 650 })
    current: number;

    @ApiProperty({ example: 1000 })
    target: number;
}

export class AchievementItemDto {
    @ApiProperty({ example: 'STREAK_7' })
    key: string;

    @ApiProperty({ example: '7 Day Streak' })
    name: string;

    @ApiProperty({ example: 'Maintain a 7-day study streak' })
    description: string;

    @ApiPropertyOptional({ example: 'https://example.com/achievement.png' })
    iconUrl: string | null;

    @ApiProperty({ example: 100 })
    xpReward: number;

    @ApiPropertyOptional({ example: '2026-06-16T10:00:00.000Z' })
    earnedAt?: string;

    @ApiPropertyOptional({ type: AchievementProgressDto })
    progress?: AchievementProgressDto;
}

export class AchievementsResponseDto {
    @ApiProperty({ type: [AchievementItemDto] })
    unlocked: AchievementItemDto[];

    @ApiProperty({ type: [AchievementItemDto] })
    locked: AchievementItemDto[];
}

export class LeaderboardUserDto {
    @ApiProperty({ example: 1 })
    rank: number;

    @ApiProperty({ example: { id: 'uuid', displayName: 'John Doe', avatarUrl: 'https://...' } })
    user: { id: string; displayName: string; avatarUrl: string | null };

    @ApiProperty({ example: 12500 })
    xp: number;

    @ApiProperty({ example: 25 })
    level: number;
}

export class LeaderboardQueryDto {
    @ApiPropertyOptional({ example: 'alltime' })
    @IsOptional()
    @IsString({ message: 'period phải là chuỗi kí tự' })
    @IsIn(['week', 'month', 'alltime'], { message: 'period không hợp lệ' })
    period?: 'week' | 'month' | 'alltime' = 'alltime';

    @ApiPropertyOptional({ example: 10, description: 'Top 10/20/50' })
    @IsOptional()
    @IsInt({ message: 'limit phải là số nguyên' })
    @IsIn([10, 20, 50], { message: 'limit chỉ nhận giá trị 10, 20 hoặc 50' })
    @Type(() => Number)
    limit?: number = 10;
}
