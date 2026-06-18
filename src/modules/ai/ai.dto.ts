import { IsString, IsOptional, IsInt, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { AI_CONSTANTS } from './ai.constant';

export class ExtractWordsDto {
    @ApiProperty({ example: 'Climate change is one of the most pressing issues facing humanity today.' })
    @IsString({ message: 'text phải là chuỗi kí tự' })
    text: string;

    @ApiProperty({ example: 'en' })
    @IsString({ message: 'languageId phải là chuỗi kí tự' })
    languageId: string;
}

export class GenerateNotesDto {
    @ApiProperty({ example: 'Climate Change' })
    @IsString({ message: 'topic phải là chuỗi kí tự' })
    topic: string;

    @ApiProperty({ example: 'en' })
    @IsString({ message: 'languageId phải là chuỗi kí tự' })
    languageId: string;

    @ApiPropertyOptional({ example: 10 })
    @IsOptional()
    @IsInt({ message: 'count phải là số nguyên' })
    @Min(1, { message: 'count tối thiểu là 1' })
    @Max(AI_CONSTANTS.MAX_NOTES, { message: `count tối đa là ${AI_CONSTANTS.MAX_NOTES}` })
    @Type(() => Number)
    count?: number;
}

export class AiNoteDto {
    @ApiProperty({ example: 'pressing' })
    word: string;

    @ApiProperty({ example: 'requiring immediate action or attention' })
    meaning: string | null;

    @ApiProperty({ example: '/ˈpres.ɪŋ/' })
    ipa: string | null;

    @ApiProperty({ example: 'Climate change is one of the most pressing issues.' })
    example: string | null;

    @ApiProperty({ example: 'ADJECTIVE' })
    partOfSpeech: string | null;

    @ApiProperty({ example: 3 })
    difficulty: number;
}

export class NotesListDto {
    @ApiProperty({ type: [AiNoteDto] })
    notes: AiNoteDto[];
}

export class DetectImageDto {
    @ApiProperty({ type: 'string', format: 'binary' })
    file: any;
}

export class DetectObjectDto {
    @ApiProperty({ example: 'cat' })
    label: string;

    @ApiProperty({ example: 0.98 })
    confidence: number;

    @ApiProperty({ example: [120, 45, 180, 210] })
    bbox: number[];
}

export class DetectImageResponseDto {
    @ApiProperty({ example: 'https://res.cloudinary.com/.../image.jpg' })
    imageUrl: string;

    @ApiProperty({ type: [DetectObjectDto] })
    objects: DetectObjectDto[];
}
