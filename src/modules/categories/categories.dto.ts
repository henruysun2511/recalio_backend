import { IsString, IsOptional, MaxLength, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../common/dtos/pagination.dto';
import { CATEGORY_CONSTANTS } from './categories.constant';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Công nghệ' })
  @IsString()
  @MaxLength(CATEGORY_CONSTANTS.NAME_MAX_LENGTH)
  @Transform(({ value }) => value?.trim())
  name: string;

  @ApiProperty({ example: 'cong-nghe' })
  @IsString()
  @MaxLength(CATEGORY_CONSTANTS.SLUG_MAX_LENGTH)
  @Transform(({ value }) => value?.trim().toLowerCase().replace(/\s+/g, '-'))
  slug: string;

  @ApiPropertyOptional({ example: 'Bài viết về công nghệ' })
  @IsOptional()
  @IsString()
  @MaxLength(CATEGORY_CONSTANTS.DESCRIPTION_MAX_LENGTH)
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  parentId?: string;
}

export class UpdateCategoryDto {
  @ApiPropertyOptional({ example: 'Công nghệ mới' })
  @IsOptional()
  @IsString()
  @MaxLength(CATEGORY_CONSTANTS.NAME_MAX_LENGTH)
  name?: string;

  @ApiPropertyOptional({ example: 'cong-nghe-moi' })
  @IsOptional()
  @IsString()
  @MaxLength(CATEGORY_CONSTANTS.SLUG_MAX_LENGTH)
  slug?: string;

  @ApiPropertyOptional({ example: 'Bài viết về công nghệ mới nhất' })
  @IsOptional()
  @IsString()
  @MaxLength(CATEGORY_CONSTANTS.DESCRIPTION_MAX_LENGTH)
  description?: string;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsUUID()
  parentId?: string | null;
}

export class QueryCategoryDto extends PaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;
}

export class CategoryResponseDto {
  @ApiProperty() categoryId: string;
  @ApiProperty() name: string;
  @ApiProperty() slug: string;
  @ApiPropertyOptional() description: string | null;
  @ApiPropertyOptional() parentId: string | null;
  @ApiProperty() depth: number;
  @ApiProperty() sortOrder: number;
  @ApiProperty() postCount: number;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
}
