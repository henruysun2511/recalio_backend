export const ACHIEVEMENT_CONSTANTS = {
  KEY_MAX_LENGTH: 50,
  NAME_MAX_LENGTH: 100,
  DESCRIPTION_MAX_LENGTH: 500,
  ICON_URL_MAX_LENGTH: 500,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  CONDITION_TYPES: ['streak', 'reviews', 'cards', 'xp'] as const,
} as const;

export type AchievementConditionType =
  (typeof ACHIEVEMENT_CONSTANTS.CONDITION_TYPES)[number];
