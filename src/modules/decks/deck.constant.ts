export const DECK_CONSTANTS = {
    NAME_MIN_LENGTH: 1,
    NAME_MAX_LENGTH: 200,
    DESC_MAX_LENGTH: 2000,
    TAG_MAX_LENGTH: 50,
    MAX_TAGS: 20,
    MAX_DEPTH: 4,
    SORT_FIELDS: ['createdAt', 'updatedAt', 'name', 'downloadCount'] as const,
} as const;
