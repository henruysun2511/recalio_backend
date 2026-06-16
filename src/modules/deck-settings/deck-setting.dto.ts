import { IsOptional, IsEnum, IsInt, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Algorithm, LeechAction } from '@prisma/client';
import { DECK_SETTING_CONSTANTS } from './deck-setting.constant';

export class UpdateDeckSettingDto {
    @ApiPropertyOptional({ enum: Algorithm, example: 'FSRS' })
    @IsOptional()
    @IsEnum(Algorithm, { message: 'Thuật toán không hợp lệ' })
    algorithm?: Algorithm;

    @ApiPropertyOptional({ example: 20 })
    @IsOptional()
    @IsInt({ message: 'Số thẻ mới mỗi ngày phải là số nguyên' })
    @Min(DECK_SETTING_CONSTANTS.NEW_CARDS_PER_DAY_MIN, { message: 'Số thẻ mới mỗi ngày tối thiểu là 0' })
    @Max(DECK_SETTING_CONSTANTS.NEW_CARDS_PER_DAY_MAX, { message: 'Số thẻ mới mỗi ngày tối đa là 9999' })
    @Type(() => Number)
    newCardsPerDay?: number;

    @ApiPropertyOptional({ example: 200 })
    @IsOptional()
    @IsInt({ message: 'Số ôn tập mỗi ngày phải là số nguyên' })
    @Min(DECK_SETTING_CONSTANTS.REVIEWS_PER_DAY_MIN, { message: 'Số ôn tập mỗi ngày tối thiểu là 0' })
    @Max(DECK_SETTING_CONSTANTS.REVIEWS_PER_DAY_MAX, { message: 'Số ôn tập mỗi ngày tối đa là 99999' })
    @Type(() => Number)
    reviewsPerDay?: number;

    @ApiPropertyOptional({ example: '1 10' })
    @IsOptional()
    learningSteps?: string;

    @ApiPropertyOptional({ example: 1 })
    @IsOptional()
    @IsInt({ message: 'graduatingInterval phải là số nguyên' })
    @Min(DECK_SETTING_CONSTANTS.INTERVAL_MIN, { message: 'Khoảng cách tối thiểu là 0' })
    @Type(() => Number)
    graduatingInterval?: number;

    @ApiPropertyOptional({ example: 4 })
    @IsOptional()
    @IsInt({ message: 'easyInterval phải là số nguyên' })
    @Min(DECK_SETTING_CONSTANTS.INTERVAL_MIN, { message: 'Khoảng cách tối thiểu là 0' })
    @Type(() => Number)
    easyInterval?: number;

    @ApiPropertyOptional({ example: 1.0 })
    @IsOptional()
    @IsNumber({}, { message: 'intervalModifier phải là số' })
    @Min(DECK_SETTING_CONSTANTS.MODIFIER_MIN, { message: 'intervalModifier tối thiểu là 0' })
    @Max(DECK_SETTING_CONSTANTS.MODIFIER_MAX, { message: 'intervalModifier tối đa là 3' })
    @Type(() => Number)
    intervalModifier?: number;

    @ApiPropertyOptional({ example: 1.3 })
    @IsOptional()
    @IsNumber({}, { message: 'easyBonus phải là số' })
    @Min(DECK_SETTING_CONSTANTS.EASE_MIN, { message: 'easyBonus tối thiểu là 1' })
    @Max(DECK_SETTING_CONSTANTS.EASE_MAX, { message: 'easyBonus tối đa là 5' })
    @Type(() => Number)
    easyBonus?: number;

    @ApiPropertyOptional({ example: 1.2 })
    @IsOptional()
    @IsNumber({}, { message: 'hardInterval phải là số' })
    @Min(DECK_SETTING_CONSTANTS.MODIFIER_MIN, { message: 'hardInterval tối thiểu là 0' })
    @Max(DECK_SETTING_CONSTANTS.MODIFIER_MAX, { message: 'hardInterval tối đa là 3' })
    @Type(() => Number)
    hardInterval?: number;

    @ApiPropertyOptional({ example: 36500 })
    @IsOptional()
    @IsInt({ message: 'maximumInterval phải là số nguyên' })
    @Min(DECK_SETTING_CONSTANTS.INTERVAL_MIN, { message: 'Khoảng cách tối thiểu là 0' })
    @Type(() => Number)
    maximumInterval?: number;

    @ApiPropertyOptional({ example: '10' })
    @IsOptional()
    lapseSteps?: string;

    @ApiPropertyOptional({ example: 1 })
    @IsOptional()
    @IsInt({ message: 'minimumInterval phải là số nguyên' })
    @Min(DECK_SETTING_CONSTANTS.INTERVAL_MIN, { message: 'Khoảng cách tối thiểu là 0' })
    @Type(() => Number)
    minimumInterval?: number;

    @ApiPropertyOptional({ example: 8 })
    @IsOptional()
    @IsInt({ message: 'leechThreshold phải là số nguyên' })
    @Min(DECK_SETTING_CONSTANTS.LEECH_THRESHOLD_MIN, { message: 'leechThreshold tối thiểu là 1' })
    @Max(DECK_SETTING_CONSTANTS.LEECH_THRESHOLD_MAX, { message: 'leechThreshold tối đa là 99' })
    @Type(() => Number)
    leechThreshold?: number;

    @ApiPropertyOptional({ enum: LeechAction, example: 'SUSPEND' })
    @IsOptional()
    @IsEnum(LeechAction, { message: 'Leech action không hợp lệ' })
    leechAction?: LeechAction;

    @ApiPropertyOptional({ example: null })
    @IsOptional()
    fsrsWeights?: string | null;

    @ApiPropertyOptional({ example: 0.9 })
    @IsOptional()
    @IsNumber({}, { message: 'requestRetention phải là số' })
    @Min(DECK_SETTING_CONSTANTS.RETENTION_MIN, { message: 'requestRetention tối thiểu là 0.5' })
    @Max(DECK_SETTING_CONSTANTS.RETENTION_MAX, { message: 'requestRetention tối đa là 0.99' })
    @Type(() => Number)
    requestRetention?: number;
}

export class DeckSettingResponseDto {
    id: string;
    deckId: string;
    algorithm: Algorithm;
    newCardsPerDay: number;
    reviewsPerDay: number;
    learningSteps: string;
    graduatingInterval: number;
    easyInterval: number;
    intervalModifier: number;
    easyBonus: number;
    hardInterval: number;
    maximumInterval: number;
    lapseSteps: string;
    minimumInterval: number;
    leechThreshold: number;
    leechAction: LeechAction;
    fsrsWeights: string | null;
    requestRetention: number;
    updatedAt: Date;
}
