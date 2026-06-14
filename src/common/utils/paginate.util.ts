import { PaginationDto } from '../dtos/pagination.dto';

export function paginate<T>(data: T[], total: number, query: PaginationDto) {
  const { page, limit } = query;
  const totalPages = total > 0 ? Math.ceil(total / limit) : 0;

  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
}
