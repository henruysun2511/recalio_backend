import { IsOptional, IsString, MinLength, MaxLength, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';
import { PaginationDto } from './pagination.dto';
import { SortOrder } from '../enums/sort.enum';


export class SearchDto extends PaginationDto {
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  search?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return undefined;

    const normalized = String(value).trim().toLowerCase();
    if (normalized === '0' || normalized === 'desc') return SortOrder.DESC;
    if (normalized === '1' || normalized === 'asc') return SortOrder.ASC;

    return value;
  })
  @IsEnum(SortOrder)
  sortOrder: SortOrder = SortOrder.DESC;
}