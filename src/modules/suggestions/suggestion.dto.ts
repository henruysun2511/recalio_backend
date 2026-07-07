import { IsString, MinLength, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { SUGGESTION_CONSTANTS } from './suggestion.constant';

export class CreateSuggestionDto {
    @ApiProperty({ example: 'Nên thêm tính năng dark mode cho website' })
    @IsString({ message: 'Nội dung góp ý phải là chuỗi kí tự' })
    @MinLength(1, { message: 'Nội dung góp ý không được để trống' })
    @MaxLength(SUGGESTION_CONSTANTS.CONTENT_MAX_LENGTH, { message: `Nội dung góp ý không được quá ${SUGGESTION_CONSTANTS.CONTENT_MAX_LENGTH} kí tự` })
    @Transform(({ value }) => value?.trim())
    content: string;
}

export class SuggestionResponseDto {
    @ApiProperty({ example: 'uuid' })
    id: string;

    @ApiProperty({ example: 'uuid' })
    userId: string;

    @ApiProperty({ example: 'Nên thêm tính năng dark mode' })
    content: string;

    @ApiProperty({ example: false })
    isRead: boolean;

    @ApiProperty({ example: 'user@example.com', nullable: true })
    email: string | null;

    @ApiProperty({ example: '2026-07-06T10:00:00.000Z' })
    createdAt: Date;

    @ApiProperty({ example: '2026-07-06T10:00:00.000Z' })
    updatedAt: Date;

    @ApiProperty({ example: { id: 'uuid', username: 'john_doe', displayName: 'John Doe', avatarUrl: null } })
    user: Record<string, unknown>;
}
