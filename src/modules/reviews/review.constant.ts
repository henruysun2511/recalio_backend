export const REVIEW_CONSTANTS = {
  RATING_MIN: 1,
  RATING_MAX: 5,
  COMMENT_MAX_LENGTH: 2000,
  SORT_FIELDS: ['createdAt', 'updatedAt', 'rating'] as const,
} as const;
