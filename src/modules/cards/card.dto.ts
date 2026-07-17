import { Type } from 'class-transformer';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CardState, ReviewRating } from '@prisma/client';
import { PaginationDto } from '../../common/dtos/pagination.dto';
import { CARD_CONSTANTS } from './card.constant';

export class DueCardsQueryDto {
  @ApiPropertyOptional({ example: 'uuid' })
  @IsOptional()
  @IsString({ message: 'deckId phải là chuỗi kí tự' })
  deckId?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'page phải là số nguyên' })
  @Min(1, { message: 'page tối thiểu là 1' })
  page?: number;

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'limit phải là số nguyên' })
  @Min(1, { message: 'limit tối thiểu là 1' })
  @Max(CARD_CONSTANTS.MAX_LIMIT, {
    message: `limit tối đa là ${CARD_CONSTANTS.MAX_LIMIT}`,
  })
  limit?: number;

  @ApiPropertyOptional({ enum: ['normal', 'cram', 'preview'], default: 'normal' })
  @IsOptional()
  @IsString({ message: 'mode phải là chuỗi kí tự' })
  mode?: 'normal' | 'cram' | 'preview';
}

export class CustomSessionCardsQueryDto {
  @ApiProperty({ example: 'uuid' })
  @IsString({ message: 'sessionId phải là chuỗi kí tự' })
  sessionId: string;

  @ApiProperty({ example: 'uuid' })
  @IsString({ message: 'deckId phải là chuỗi kí tự' })
  deckId: string;

  @ApiPropertyOptional({ example: 999 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'limit phải là số nguyên' })
  @Min(1, { message: 'limit tối thiểu là 1' })
  @Max(CARD_CONSTANTS.MAX_LIMIT, {
    message: `limit tối đa là ${CARD_CONSTANTS.MAX_LIMIT}`,
  })
  limit?: number;
}

export class FindByDeckQueryDto extends PaginationDto {
  @ApiPropertyOptional({ enum: CardState })
  @IsOptional()
  @IsEnum(CardState, { message: 'state không hợp lệ' })
  state?: CardState;
}

export class ReviewCardDto {
  @ApiProperty({ enum: ReviewRating, example: 'GOOD' })
  @IsEnum(ReviewRating, { message: 'Rating không hợp lệ' })
  rating: ReviewRating;

  @ApiProperty({ example: 5000 })
  @IsInt({ message: 'responseTimeMs phải là số nguyên' })
  @Min(0, { message: 'responseTimeMs không được âm' })
  responseTimeMs: number;

  @ApiPropertyOptional({ example: 'uuid' })
  @IsOptional()
  @IsString({ message: 'sessionId phải là chuỗi kí tự' })
  sessionId?: string;
}

export class CardResponseDto {
  id: string;
  noteId: string;
  deckId: string;
  cardTemplateId: string;
  state: CardState;
  due: Date;
  variantIndex?: number | null;
  frontHtml: string;
  backHtml: string;
  css: string;
  occlusion?: {
    imageUrl: string;
    masks: { x: number; y: number; width: number; height: number; groupIndex: number; label?: string | null }[];
  };
  templateType: string;
  note: {
    word?: string | null;
    meaning?: string | null;
    ipa?: string | null;
    partOfSpeech?: string | null;
    example?: string | null;
    audioUrl?: string | null;
    imageUrl?: string | null;
    fields?: Record<string, any> | null;
  };
}

export class CardStatsDto {
  new: number;
  learning: number;
  review: number;
  due: number;
  suspended: number;
  total: number;
}
