export enum SortOrder {
  DESC = 'desc',
  ASC = 'asc',
}

export const BaseSortBy = {
  CREATED_AT: 'createdAt',
  UPDATED_AT: 'updatedAt',
} as const;
