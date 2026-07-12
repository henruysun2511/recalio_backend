import {
  IsString,
  IsOptional,
  IsInt,
  Min,
  Max,
  MaxLength,
  IsIn,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { REVIEW_CONSTANTS } from './review.constant';
import { SearchDto } from '../../common/dtos/search.dto';

export class ReviewQueryDto extends SearchDto {
  @ApiPropertyOptional({ example: 'createdAt' })
  @IsOptional()
  @IsString({ message: 'sort phải là chuỗi kí tự' })
  @IsIn(REVIEW_CONSTANTS.SORT_FIELDS, { message: 'sort không hợp lệ' })
  sort?: 'createdAt' | 'updatedAt' | 'rating' = 'createdAt';
}

export class CreateReviewDto {
  @ApiProperty({ example: 5, minimum: 1, maximum: 5 })
  @IsInt({ message: 'Đánh giá phải là số nguyên' })
  @Min(REVIEW_CONSTANTS.RATING_MIN, { message: 'Đánh giá tối thiểu là 1' })
  @Max(REVIEW_CONSTANTS.RATING_MAX, { message: 'Đánh giá tối đa là 5' })
  rating: number;

  @ApiPropertyOptional({ example: 'Deck rất hữu ích!' })
  @IsOptional()
  @IsString({ message: 'Bình luận phải là chuỗi kí tự' })
  @MaxLength(REVIEW_CONSTANTS.COMMENT_MAX_LENGTH, {
    message: 'Bình luận không được quá 2000 kí tự',
  })
  @Transform(({ value }) => value?.trim())
  comment?: string;
}

export class ReviewUserDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: 'john_doe' })
  username: string;

  @ApiProperty({ example: 'John Doe' })
  displayName: string;

  @ApiProperty({ example: 'https://example.com/avatar.jpg', nullable: true })
  avatarUrl: string | null;
}

export class ReviewResponseDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: 'uuid' })
  deckId: string;

  @ApiProperty({ example: 5 })
  rating: number;

  @ApiProperty({ example: 'Deck rất hữu ích!', nullable: true })
  comment: string | null;

  @ApiProperty({ example: '2026-06-16T10:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-06-16T10:00:00.000Z' })
  updatedAt: Date;

  @ApiPropertyOptional({ type: ReviewUserDto })
  user?: ReviewUserDto;
}

export class LatestReviewDeckDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: 'English Vocabulary' })
  name: string;

  @ApiProperty({ example: 'https://example.com/cover.jpg', nullable: true })
  coverImage: string | null;
}

export class LatestReviewResponseDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: 5 })
  rating: number;

  @ApiProperty({ example: 'Deck rất hữu ích!', nullable: true })
  comment: string | null;

  @ApiProperty({ example: '2026-06-16T10:00:00.000Z' })
  createdAt: Date;

  @ApiPropertyOptional({ type: ReviewUserDto })
  user?: ReviewUserDto;

  @ApiProperty({ type: LatestReviewDeckDto })
  deck: LatestReviewDeckDto;
}
