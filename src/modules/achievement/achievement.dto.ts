import {
  IsString,
  IsOptional,
  IsUrl,
  IsInt,
  Min,
  IsObject,
  ValidateNested,
  IsIn,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ACHIEVEMENT_CONSTANTS } from './achievement.constant';
import { SearchDto } from '../../common/dtos/search.dto';

export class ConditionDto {
  @ApiProperty({
    example: 'streak',
    enum: ACHIEVEMENT_CONSTANTS.CONDITION_TYPES,
  })
  @IsString()
  @IsIn(ACHIEVEMENT_CONSTANTS.CONDITION_TYPES)
  type: 'streak' | 'reviews' | 'cards' | 'xp';

  @ApiProperty({ example: 7, minimum: 1 })
  @IsInt()
  @Min(1)
  value: number;
}

export class CreateAchievementDto {
  @ApiProperty({
    example: 'STREAK_7',
    description: 'Unique key for achievement',
  })
  @IsString()
  @MinLength(1, { message: 'Key is required' })
  @MaxLength(ACHIEVEMENT_CONSTANTS.KEY_MAX_LENGTH)
  key: string;

  @ApiProperty({ example: '7 Ngày liên tiếp', description: 'Achievement name' })
  @IsString()
  @MinLength(1, { message: 'Name is required' })
  @MaxLength(ACHIEVEMENT_CONSTANTS.NAME_MAX_LENGTH)
  name: string;

  @ApiProperty({ example: 'Học liên tiếp 7 ngày', description: 'Description' })
  @IsString()
  @MinLength(1, { message: 'Description is required' })
  @MaxLength(ACHIEVEMENT_CONSTANTS.DESCRIPTION_MAX_LENGTH)
  description: string;

  @ApiPropertyOptional({ example: 'https://example.com/icon.png' })
  @IsOptional()
  @IsUrl()
  iconUrl?: string | null;

  @ApiProperty({ example: 50, description: 'XP reward for unlocking' })
  @IsInt()
  @Min(0)
  xpReward: number;

  @ApiProperty({ description: 'Condition to unlock', type: ConditionDto })
  @IsObject()
  @ValidateNested()
  @Type(() => ConditionDto)
  condition: ConditionDto;
}

export class UpdateAchievementDto {
  @ApiPropertyOptional({ example: '7 Ngày liên tiếp' })
  @IsOptional()
  @IsString()
  @MaxLength(ACHIEVEMENT_CONSTANTS.NAME_MAX_LENGTH)
  name?: string;

  @ApiPropertyOptional({ example: 'Học liên tiếp 7 ngày' })
  @IsOptional()
  @IsString()
  @MaxLength(ACHIEVEMENT_CONSTANTS.DESCRIPTION_MAX_LENGTH)
  description?: string;

  @ApiPropertyOptional({ example: 'https://example.com/icon.png' })
  @IsOptional()
  @IsUrl()
  iconUrl?: string | null;

  @ApiPropertyOptional({ example: 50 })
  @IsOptional()
  @IsInt()
  @Min(0)
  xpReward?: number;

  @ApiPropertyOptional({
    description: 'Condition to unlock',
    type: ConditionDto,
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ConditionDto)
  condition?: ConditionDto;
}

export class AchievementResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  key: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  iconUrl: string | null;

  @ApiProperty()
  xpReward: number;

  @ApiProperty()
  condition: { type: string; value: number };

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class QueryAchievementDto extends SearchDto {
  @ApiPropertyOptional({ example: 'streak' })
  @IsOptional()
  @IsString()
  @IsIn(ACHIEVEMENT_CONSTANTS.CONDITION_TYPES)
  conditionType?: string;
}
