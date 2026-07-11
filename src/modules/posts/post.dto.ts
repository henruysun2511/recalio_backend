import {
  IsOptional,
  IsString,
  MaxLength,
  IsArray,
  IsUUID,
  ArrayMaxSize,
  IsEnum,
  MinLength,
  IsBoolean,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReportReason } from '@prisma/client';
import { POST_CONSTANTS } from './post.constant';
import { SearchDto } from 'src/common/dtos/search.dto';

export class CreatePostDto {
  @ApiProperty({ example: 'Cách học tiếng Nhật hiệu quả' })
  @IsString()
  @MinLength(1)
  @MaxLength(POST_CONSTANTS.TITLE_MAX_LENGTH)
  @Transform(({ value }) => value?.trim())
  title: string;

  @ApiPropertyOptional({ example: 'Chia sẻ phương pháp học...' })
  @IsOptional()
  @IsString()
  @MaxLength(POST_CONSTANTS.CONTENT_MAX_LENGTH)
  @Transform(({ value }) => value?.trim())
  content?: string;

  @ApiPropertyOptional({ example: ['tieng-nhat', 'hoc-tap'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(POST_CONSTANTS.MAX_TAGS)
  @Transform(({ value }) => value?.map((t: string) => t.trim().toLowerCase()))
  tags?: string[];

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  isPublished?: boolean;

  @ApiProperty({ example: ['uuid-deck-1', 'uuid-deck-2'] })
  @IsArray()
  @IsUUID('4', { each: true })
  @ArrayMaxSize(POST_CONSTANTS.MAX_DECKS_PER_POST)
  deckIds: string[];
}

export class UpdatePostDto {
  @ApiPropertyOptional({ example: 'Cách học tiếng Nhật hiệu quả' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(POST_CONSTANTS.TITLE_MAX_LENGTH)
  @Transform(({ value }) => value?.trim())
  title?: string;

  @ApiPropertyOptional({ example: 'Chia sẻ phương pháp học...' })
  @IsOptional()
  @IsString()
  @MaxLength(POST_CONSTANTS.CONTENT_MAX_LENGTH)
  @Transform(({ value }) => value?.trim())
  content?: string;

  @ApiPropertyOptional({ example: ['tieng-nhat', 'hoc-tap'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(POST_CONSTANTS.MAX_TAGS)
  @Transform(({ value }) => value?.map((t: string) => t.trim().toLowerCase()))
  tags?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  @ArrayMaxSize(POST_CONSTANTS.MAX_DECKS_PER_POST)
  deckIds?: string[];

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  isPublished?: boolean;
}

export class PostQueryDto extends SearchDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  tag?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  userId?: string;
}

export class ReportPostDto {
  @ApiProperty({ enum: ReportReason })
  @IsEnum(ReportReason)
  reason: ReportReason;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}

export class BanPostDto {
  @ApiProperty()
  @IsBoolean({ message: 'Trạng thái cấm không hợp lệ' })
  isBanned: boolean;
}
