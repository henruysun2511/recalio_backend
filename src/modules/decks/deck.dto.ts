import { IsString, IsOptional, IsBoolean, IsArray, MinLength, MaxLength, ArrayMaxSize, IsIn } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DECK_CONSTANTS } from './deck.constant';
import { SearchDto } from '../../common/dtos/search.dto';
import { PAGINATION } from '../../common/constants/pagination.constant';

export class QueryDeckDto extends SearchDto {
    @ApiPropertyOptional({ example: 'createdAt' })
    @IsOptional()
    @IsString({ message: 'sort phải là chuỗi kí tự' })
    @IsIn(DECK_CONSTANTS.SORT_FIELDS, { message: 'sort không hợp lệ' })
    sort?: 'createdAt' | 'updatedAt' | 'name' | 'downloadCount' = 'createdAt';

    @ApiPropertyOptional({ example: true })
    @IsOptional()
    @IsBoolean({ message: 'isPublic phải là boolean' })
    @Transform(({ value }) => value === 'true' || value === true)
    isPublic?: boolean;

    get take(): number {
        return Math.min(this.limit ?? PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT);
    }
}

export class CreateDeckDto {
    @ApiProperty({ example: 'English Vocabulary' })
    @IsString({ message: 'Tên deck phải là chuỗi kí tự' })
    @MinLength(DECK_CONSTANTS.NAME_MIN_LENGTH, { message: 'Tên deck không được để trống' })
    @MaxLength(DECK_CONSTANTS.NAME_MAX_LENGTH, { message: 'Tên deck không được quá 200 kí tự' })
    @Transform(({ value }) => value?.trim())
    name: string;

    @ApiPropertyOptional({ example: 'English::IELTS' })
    @IsOptional()
    @IsString({ message: 'Full path phải là chuỗi kí tự' })
    fullPath?: string;

    @ApiPropertyOptional({ example: 'Từ vựng IELTS band 7+' })
    @IsOptional()
    @IsString({ message: 'Mô tả phải là chuỗi kí tự' })
    @MaxLength(DECK_CONSTANTS.DESC_MAX_LENGTH, { message: 'Mô tả không được quá 2000 kí tự' })
    @Transform(({ value }) => value?.trim())
    description?: string;

    @ApiPropertyOptional({ example: 'https://example.com/cover.jpg' })
    @IsOptional()
    @IsString({ message: 'Ảnh bìa phải là chuỗi kí tự' })
    coverImage?: string;

    @ApiPropertyOptional({ example: false })
    @IsOptional()
    @IsBoolean({ message: 'isPublic phải là boolean' })
    isPublic?: boolean;

    @ApiPropertyOptional({ example: ['english', 'ielts'] })
    @IsOptional()
    @IsArray({ message: 'Tags phải là mảng' })
    @IsString({ each: true, message: 'Mỗi tag phải là chuỗi kí tự' })
    @MaxLength(DECK_CONSTANTS.TAG_MAX_LENGTH, { each: true, message: 'Tag không được quá 50 kí tự' })
    @ArrayMaxSize(DECK_CONSTANTS.MAX_TAGS, { message: 'Không được quá 20 tags' })
    @Transform(({ value }) => value?.map((t: string) => t.trim().toLowerCase()))
    tags?: string[];

    @ApiPropertyOptional({ example: null })
    @IsOptional()
    @IsString({ message: 'parentId phải là chuỗi kí tự' })
    parentId?: string;
}

export class UpdateDeckDto {
    @ApiPropertyOptional({ example: 'English Vocabulary' })
    @IsOptional()
    @IsString({ message: 'Tên deck phải là chuỗi kí tự' })
    @MinLength(DECK_CONSTANTS.NAME_MIN_LENGTH, { message: 'Tên deck không được để trống' })
    @MaxLength(DECK_CONSTANTS.NAME_MAX_LENGTH, { message: 'Tên deck không được quá 200 kí tự' })
    @Transform(({ value }) => value?.trim())
    name?: string;

    @ApiPropertyOptional({ example: 'English::IELTS' })
    @IsOptional()
    @IsString({ message: 'Full path phải là chuỗi kí tự' })
    fullPath?: string;

    @ApiPropertyOptional({ example: 'Từ vựng IELTS band 7+', nullable: true })
    @IsOptional()
    @IsString({ message: 'Mô tả phải là chuỗi kí tự' })
    @MaxLength(DECK_CONSTANTS.DESC_MAX_LENGTH, { message: 'Mô tả không được quá 2000 kí tự' })
    @Transform(({ value }) => value?.trim())
    description?: string | null;

    @ApiPropertyOptional({ example: 'https://example.com/cover.jpg', nullable: true })
    @IsOptional()
    @IsString({ message: 'Ảnh bìa phải là chuỗi kí tự' })
    coverImage?: string | null;

    @ApiPropertyOptional({ example: false })
    @IsOptional()
    @IsBoolean({ message: 'isPublic phải là boolean' })
    isPublic?: boolean;

    @ApiPropertyOptional({ example: true })
    @IsOptional()
    @IsBoolean({ message: 'isArchived phải là boolean' })
    isArchived?: boolean;

    @ApiPropertyOptional({ example: ['english', 'ielts'] })
    @IsOptional()
    @IsArray({ message: 'Tags phải là mảng' })
    @IsString({ each: true, message: 'Mỗi tag phải là chuỗi kí tự' })
    @MaxLength(DECK_CONSTANTS.TAG_MAX_LENGTH, { each: true, message: 'Tag không được quá 50 kí tự' })
    @ArrayMaxSize(DECK_CONSTANTS.MAX_TAGS, { message: 'Không được quá 20 tags' })
    @Transform(({ value }) => value?.map((t: string) => t.trim().toLowerCase()))
    tags?: string[];
}

export class MoveDeckDto {
    @ApiProperty({ example: 'uuid', nullable: true })
    @IsOptional()
    @IsString({ message: 'parentId phải là chuỗi kí tự' })
    parentId?: string | null;
}

export class DeckUserDto {
    @ApiProperty({ example: 'uuid' })
    id: string;

    @ApiProperty({ example: 'john_doe' })
    username: string;

    @ApiProperty({ example: 'John Doe' })
    displayName: string;

    @ApiProperty({ example: 'https://example.com/avatar.jpg', nullable: true })
    avatarUrl: string | null;
}

export class DeckCountDto {
    @ApiProperty({ example: 5 })
    notes: number;

    @ApiProperty({ example: 20 })
    cards: number;
}

export class DeckResponseDto {
    @ApiProperty({ example: 'uuid' })
    id: string;

    @ApiProperty({ example: 'uuid' })
    userId: string;

    @ApiProperty({ example: 'English Vocabulary' })
    name: string;

    @ApiProperty({ example: 'English::IELTS' })
    fullPath: string;

    @ApiProperty({ example: 'Từ vựng IELTS band 7+', nullable: true })
    description: string | null;

    @ApiProperty({ example: 'https://example.com/cover.jpg', nullable: true })
    coverImage: string | null;

    @ApiProperty({ example: false })
    isArchived: boolean;

    @ApiProperty({ example: true })
    isPublic: boolean;

    @ApiProperty({ example: ['english', 'ielts'] })
    tags: string[];

    @ApiProperty({ example: 10 })
    downloadCount: number;

    @ApiProperty({ example: '2026-06-16T10:00:00.000Z' })
    createdAt: Date;

    @ApiProperty({ example: '2026-06-16T10:00:00.000Z' })
    updatedAt: Date;

    @ApiPropertyOptional({ type: DeckUserDto })
    user?: DeckUserDto;

    @ApiPropertyOptional({ type: DeckCountDto })
    _count?: DeckCountDto;
}

