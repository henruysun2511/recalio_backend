import { IsString, IsOptional, IsEnum, IsInt, Min, Max, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CardState, ReviewRating } from '@prisma/client';
import { CARD_CONSTANTS } from './card.constant';

export class DueCardsQueryDto {
    @ApiPropertyOptional({ example: 'uuid' })
    @IsOptional()
    @IsString({ message: 'deckId phải là chuỗi kí tự' })
    deckId?: string;

    @ApiPropertyOptional({ example: 1 })
    @IsOptional()
    @IsInt({ message: 'page phải là số nguyên' })
    @Min(1, { message: 'page tối thiểu là 1' })
    page?: number;

    @ApiPropertyOptional({ example: 20 })
    @IsOptional()
    @IsInt({ message: 'limit phải là số nguyên' })
    @Min(1, { message: 'limit tối thiểu là 1' })
    @Max(CARD_CONSTANTS.MAX_LIMIT, { message: `limit tối đa là ${CARD_CONSTANTS.MAX_LIMIT}` })
    limit?: number;
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

export class FlagCardDto {
    @ApiProperty({ example: 1, description: 'Bitmask: 1=red 2=orange 4=green 8=blue' })
    @IsInt({ message: 'flags phải là số nguyên' })
    @IsIn([0, 1, 2, 4, 8], { message: 'flags không hợp lệ (0, 1, 2, 4, 8)' })
    flags: number;
}

export class CardResponseDto {
    id: string;
    noteId: string;
    deckId: string;
    cardTemplateId: string;
    state: CardState;
    flags: number;
    due: Date;
    frontHtml: string;
    backHtml: string;
    css: string;
    note: {
        word?: string | null;
        meaning?: string | null;
        ipa?: string | null;
        example?: string | null;
        audioUrl?: string | null;
    };
}

export class CardStatsDto {
    new: number;
    learning: number;
    review: number;
    due: number;
    total: number;
}
