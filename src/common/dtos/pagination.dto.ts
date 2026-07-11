import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min, IsIn } from 'class-validator';
import { PAGINATION } from '../constants/pagination.constant';
import { SortOrder } from '../enums/sort.enum';

export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(PAGINATION.DEFAULT_PAGE)
  page: number = PAGINATION.DEFAULT_PAGE;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(PAGINATION.MAX_LIMIT)
  limit: number = PAGINATION.DEFAULT_LIMIT;

  @IsOptional()
  @IsIn([SortOrder.ASC, SortOrder.DESC])
  sortOrder: SortOrder = SortOrder.DESC;

  get skip() {
    return (this.page - 1) * this.limit;
  }
}
