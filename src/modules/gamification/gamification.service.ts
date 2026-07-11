import { Injectable, Logger } from '@nestjs/common';
import { NotificationType } from '@prisma/client';
import { GamificationRepository } from './gamification.repository';
import { NotificationService } from '../notifications/notification.service';
import {
  XpResponseDto,
  AchievementsResponseDto,
  AchievementItemDto,
  AchievementProgressDto,
  LeaderboardUserDto,
  LeaderboardQueryDto,
  StudyCalendarEntryDto,
  StudyCalendarQueryDto,
  StudyStreakDto,
  ReviewStatsDto,
} from './gamification.dto';
import {
  GAMIFICATION_CONSTANTS,
  LEVEL_THRESHOLDS,
} from './gamification.constant';

@Injectable()
export class GamificationService {
  private readonly logger = new Logger(GamificationService.name);

  constructor(
    private readonly repo: GamificationRepository,
    private readonly notificationService: NotificationService,
  ) {}

  async getXp(userId: string): Promise<XpResponseDto> {
    const xp = await this.repo.getXp(userId);
    if (!xp) {
      return {
        totalXP: 0,
        level: 1,
        currentLevelXP: 0,
        nextLevelXP: LEVEL_THRESHOLDS.getXpForLevel(1),
        progressPercent: 0,
        currentStreak: 0,
        longestStreak: 0,
      };
    }

    const cumulativeForLevel = LEVEL_THRESHOLDS.getCumulativeXpForLevel(
      xp.level,
    );
    const currentLevelXP = xp.totalXP - cumulativeForLevel;
    const nextLevelXP = LEVEL_THRESHOLDS.getXpForLevel(xp.level);
    const progressPercent =
      nextLevelXP > 0
        ? Math.min(Math.floor((currentLevelXP / nextLevelXP) * 100), 100)
        : 0;

    return {
      totalXP: xp.totalXP,
      level: xp.level,
      currentLevelXP,
      nextLevelXP,
      progressPercent,
      currentStreak: xp.currentStreak,
      longestStreak: xp.longestStreak,
    };
  }

  async getAchievements(userId: string): Promise<AchievementsResponseDto> {
    const allAchievements = await this.repo.getAllAchievements();
    const userAchievements = await this.repo.getUserAchievements(userId);

    const unlockedMap = new Map(
      userAchievements.map((ua) => [
        ua.achievement.key,
        ua.earnedAt.toISOString(),
      ]),
    );

    const totalReviews = await this.repo.getTotalReviews(userId);
    const totalCards = await this.repo.getTotalCards(userId);
    const currentStreak = await this.repo.getCurrentStreak(userId);

    const unlocked: AchievementItemDto[] = [];
    const locked: AchievementItemDto[] = [];

    for (const ach of allAchievements) {
      const earnedAt = unlockedMap.get(ach.key);
      const base: AchievementItemDto = {
        key: ach.key,
        name: ach.name,
        description: ach.description,
        iconUrl: ach.iconUrl,
        xpReward: ach.xpReward,
      };

      if (earnedAt) {
        unlocked.push({ ...base, earnedAt });
        continue;
      }

      const progress = this.calcProgress(
        ach.condition as any,
        totalReviews,
        totalCards,
        currentStreak,
      );
      locked.push({ ...base, progress });
    }

    return { unlocked, locked };
  }

  private calcProgress(
    condition: { type: string; value: number },
    totalReviews: number,
    totalCards: number,
    currentStreak: number,
  ): AchievementProgressDto {
    const target = condition.value;
    let current = 0;

    switch (condition.type) {
      case 'streak':
        current = currentStreak;
        break;
      case 'reviews':
        current = totalReviews;
        break;
      case 'cards':
        current = totalCards;
        break;
      default:
        current = 0;
    }

    return { current: Math.min(current, target), target };
  }

  async getStudyCalendar(
    userId: string,
    dto: StudyCalendarQueryDto,
  ): Promise<StudyCalendarEntryDto[]> {
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    if (dto.year && dto.month) {
      startDate = new Date(dto.year, dto.month - 1, 1);
      endDate = new Date(dto.year, dto.month, 0, 23, 59, 59, 999);
    } else if (dto.year) {
      startDate = new Date(dto.year, 0, 1);
      endDate = new Date(dto.year, 11, 31, 23, 59, 59, 999);
    } else {
      endDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        23,
        59,
        59,
        999,
      );
      startDate = new Date(endDate);
      startDate.setFullYear(startDate.getFullYear() - 1);
      startDate.setDate(1);
    }

    const raw = await this.repo.getReviewCountsByDateRange(
      userId,
      startDate,
      endDate,
    );
    return raw.map((r) => ({
      date:
        r.date instanceof Date
          ? r.date.toISOString().split('T')[0]
          : String(r.date),
      count: Number(r.count),
    }));
  }

  async getReviewStats(userId: string): Promise<ReviewStatsDto> {
    const [retentionRate, avgRaw] = await Promise.all([
      this.repo.getRetentionRate(userId),
      this.repo.getAvgResponseTimeByRating(userId),
    ]);

    const avgMap = new Map(avgRaw.map((r) => [r.rating, r.avg]));
    return {
      retentionRate,
      avgResponseTime: {
        again: avgMap.get('AGAIN') ?? 0,
        hard: avgMap.get('HARD') ?? 0,
        good: avgMap.get('GOOD') ?? 0,
        easy: avgMap.get('EASY') ?? 0,
      },
    };
  }

  async getStudyStreak(userId: string): Promise<StudyStreakDto> {
    const dates = await this.repo.getDistinctReviewDates(userId);
    const uniqueDates = dates.map((d) => {
      const dt = new Date(d.date);
      dt.setHours(0, 0, 0, 0);
      return dt.getTime();
    });

    if (uniqueDates.length === 0) {
      return { currentStreak: 0, longestStreak: 0 };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTs = today.getTime();
    const dayMs = 86400000;

    // Current streak
    let currentStreak = 0;
    const latestDate = uniqueDates[0];
    const diffFromToday = Math.round((todayTs - latestDate) / dayMs);

    if (diffFromToday <= 1) {
      const startTs = diffFromToday === 1 ? todayTs - dayMs : todayTs;
      let cursor = startTs;
      for (let i = 0; i < uniqueDates.length; i++) {
        if (uniqueDates[i] !== cursor) break;
        currentStreak++;
        cursor -= dayMs;
      }
    }

    // Longest streak
    const ascending = [...uniqueDates].sort((a, b) => a - b);
    let longestStreak = 1;
    let run = 1;
    for (let i = 1; i < ascending.length; i++) {
      if (ascending[i] - ascending[i - 1] === dayMs) {
        run++;
        if (run > longestStreak) longestStreak = run;
      } else {
        run = 1;
      }
    }

    return { currentStreak, longestStreak };
  }

  async getLeaderboard(
    userId: string,
    dto: LeaderboardQueryDto,
  ): Promise<(LeaderboardUserDto & { isMe: boolean })[]> {
    const limit = dto.limit ?? GAMIFICATION_CONSTANTS.DEFAULT_LIMIT;

    const entries = await this.repo.getLeaderboard(limit);
    const ranked = entries.map((entry, index) => ({
      rank: index + 1,
      user: entry.user,
      xp: entry.totalXP,
      level: entry.level,
      isMe: entry.user.id === userId,
    }));

    const me = ranked.find((r) => r.isMe);
    if (!me) {
      const myXp = await this.repo.getXp(userId);
      if (myXp) {
        ranked.push({
          rank: null as any,
          user: { id: userId, displayName: 'Bạn', avatarUrl: null },
          xp: myXp.totalXP,
          level: myXp.level,
          isMe: true,
        });
      }
    }

    return ranked;
  }

  async awardReviewXp(userId: string): Promise<{
    xpEarned: number;
    dailyGoalBonus: number;
    achievementUnlocked: { key: string; name: string; xpReward: number } | null;
  }> {
    const xpEarned = GAMIFICATION_CONSTANTS.XP_PER_REVIEW;
    const now = new Date();

    const xp = await this.repo.getXp(userId);
    let totalXP = (xp?.totalXP ?? 0) + xpEarned;
    let dailyGoalBonus = 0;

    let currentStreak = xp?.currentStreak ?? 0;
    let longestStreak = xp?.longestStreak ?? 0;
    const lastStudyDate = xp?.lastStudyDate;
    let dailyGoalClaimedAt = xp?.dailyGoalClaimedAt;

    const today = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    ).getTime();
    const lastStudyDay = lastStudyDate
      ? new Date(
          lastStudyDate.getFullYear(),
          lastStudyDate.getMonth(),
          lastStudyDate.getDate(),
        ).getTime()
      : 0;

    if (lastStudyDay < today) {
      const diffDays = Math.floor(
        (today - lastStudyDay) / (1000 * 60 * 60 * 24),
      );
      currentStreak = diffDays <= 1 ? currentStreak + 1 : 1;
    }
    if (currentStreak > longestStreak) longestStreak = currentStreak;

    // Kiểm tra daily goal
    const claimedToday = dailyGoalClaimedAt
      ? new Date(
          dailyGoalClaimedAt.getFullYear(),
          dailyGoalClaimedAt.getMonth(),
          dailyGoalClaimedAt.getDate(),
        ).getTime() === today
      : false;

    if (!claimedToday) {
      const todayReviewCount = await this.repo.getTodayReviewCount(userId);
      const dailyGoal = await this.repo.getDailyGoal(userId);
      const target = dailyGoal?.targetReviews ?? 0;

      if (target > 0 && todayReviewCount >= target) {
        dailyGoalBonus = Math.floor(target * 0.5);
        totalXP += dailyGoalBonus;
        dailyGoalClaimedAt = now;
        this.logger.log(
          `User ${userId}: daily goal bonus ${dailyGoalBonus} XP (target ${target})`,
        );
      }
    }

    const level =
      Math.floor(Math.sqrt(totalXP / GAMIFICATION_CONSTANTS.LEVEL_BASE_XP)) + 1;
    await this.repo.upsertXp(
      userId,
      totalXP,
      level,
      currentStreak,
      longestStreak,
      now,
      dailyGoalClaimedAt,
    );

    const achievementUnlocked = await this.checkAchievements(userId);
    if (achievementUnlocked) {
      this.logger.log(
        `User ${userId}: achievement unlocked ${achievementUnlocked.key}`,
      );
    }

    return { xpEarned, dailyGoalBonus, achievementUnlocked };
  }

  private async checkAchievements(
    userId: string,
  ): Promise<{ key: string; name: string; xpReward: number } | null> {
    const allAchievements = await this.repo.getAllAchievements();
    const totalReviews = await this.repo.getTotalReviews(userId);
    const totalCards = await this.repo.getTotalCards(userId);
    const currentStreak = await this.repo.getCurrentStreak(userId);

    for (const ach of allAchievements) {
      const alreadyUnlocked = await this.repo.isAchievementUnlocked(
        userId,
        ach.id,
      );
      if (alreadyUnlocked) continue;

      const condition = ach.condition as { type: string; value: number };
      let met = false;

      switch (condition.type) {
        case 'streak':
          met = currentStreak >= condition.value;
          break;
        case 'reviews':
          met = totalReviews >= condition.value;
          break;
        case 'cards':
          met = totalCards >= condition.value;
          break;
      }

      if (met) {
        await this.repo.unlockAchievement(userId, ach.id);

        await this.notificationService.notifyUser(
          userId,
          NotificationType.ACHIEVEMENT_EARNED,
          `Thành tích mới: ${ach.name}`,
          ach.description,
          { key: ach.key, xpReward: ach.xpReward },
        );

        const xp = await this.repo.getXp(userId);
        if (xp) {
          const newTotal = xp.totalXP + ach.xpReward;
          const newLevel =
            Math.floor(
              Math.sqrt(newTotal / GAMIFICATION_CONSTANTS.LEVEL_BASE_XP),
            ) + 1;
          await this.repo.upsertXp(
            userId,
            newTotal,
            newLevel,
            xp.currentStreak,
            xp.longestStreak,
            xp.lastStudyDate ?? new Date(),
            xp.dailyGoalClaimedAt,
          );
        }

        return { key: ach.key, name: ach.name, xpReward: ach.xpReward };
      }
    }

    return null;
  }

  async getDailyGoal(userId: string) {
    const goal = await this.repo.getDailyGoal(userId);
    return goal ?? { targetReviews: 50, targetNewCards: 20 };
  }

  async upsertDailyGoal(
    userId: string,
    dto: { targetReviews?: number; targetNewCards?: number },
  ) {
    return this.repo.upsertDailyGoal(userId, dto);
  }
}
