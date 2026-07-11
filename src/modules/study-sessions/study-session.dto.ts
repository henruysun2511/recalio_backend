import { IsString, IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SESSION_CONSTANTS } from './study-session.constant';

export class StartSessionDto {
  @ApiPropertyOptional({ example: 'uuid' })
  @IsOptional()
  @IsString({ message: 'deckId phải là chuỗi kí tự' })
  deckId?: string;
}

export class ListSessionQueryDto {
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
  @Max(100, { message: 'limit tối đa là 100' })
  limit?: number;
}

export class SessionResponseDto {
  id: string;
  deckId: string | null;
  startedAt: Date;
  endedAt: Date | null;
  stats?: {
    reviewedCards: number;
    timeSpentMs: number;
    again: number;
    hard: number;
    good: number;
    easy: number;
  };
}
