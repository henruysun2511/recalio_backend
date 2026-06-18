export const GAMIFICATION_CONSTANTS = {
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
    XP_PER_REVIEW: 5,
    XP_DAILY_GOAL: 50,
    XP_STREAK_BONUS: 100,
    LEVEL_BASE_XP: 100,
} as const;

export const LEVEL_THRESHOLDS = {
    getXpForLevel: (level: number) => level * GAMIFICATION_CONSTANTS.LEVEL_BASE_XP,
    getCumulativeXpForLevel: (level: number) => {
        const n = level - 1;
        return (n * (n + 1) / 2) * GAMIFICATION_CONSTANTS.LEVEL_BASE_XP;
    },
} as const;
