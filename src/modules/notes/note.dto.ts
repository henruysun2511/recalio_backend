import { IsString, IsOptional, IsEnum, IsArray, IsNotEmpty, MaxLength, ArrayMaxSize, IsObject, ArrayMinSize, ValidateNested } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PartOfSpeech } from '@prisma/client';
import { NOTE_CONSTANTS } from './note.constant';

export class CreateNoteDto {
    @ApiProperty({ example: 'uuid' })
    @IsString({ message: 'templateId phải là chuỗi kí tự' })
    @IsNotEmpty({ message: 'templateId không được để trống' })
    templateId: string;

    @ApiProperty({ example: 'en' })
    @IsString({ message: 'languageId phải là chuỗi kí tự' })
    @IsNotEmpty({ message: 'languageId không được để trống' })
    languageId: string;

    @ApiPropertyOptional({ example: 'hello' })
    @IsOptional()
    @IsString({ message: 'word phải là chuỗi kí tự' })
    @Transform(({ value }) => value?.trim())
    word?: string;

    @ApiPropertyOptional({ example: 'xin chào' })
    @IsOptional()
    @IsString({ message: 'meaning phải là chuỗi kí tự' })
    @Transform(({ value }) => value?.trim())
    meaning?: string;

    @ApiPropertyOptional({ example: '/həˈloʊ/' })
    @IsOptional()
    @IsString({ message: 'ipa phải là chuỗi kí tự' })
    @Transform(({ value }) => value?.trim())
    ipa?: string;

    @ApiPropertyOptional({ enum: PartOfSpeech, example: 'NOUN' })
    @IsOptional()
    @IsEnum(PartOfSpeech, { message: 'Từ loại không hợp lệ' })
    partOfSpeech?: PartOfSpeech;

    @ApiPropertyOptional({ example: 'Hello, how are you?' })
    @IsOptional()
    @IsString({ message: 'example phải là chuỗi kí tự' })
    @Transform(({ value }) => value?.trim())
    example?: string;

    @ApiPropertyOptional({ example: 'https://audio.example.com/hello.mp3' })
    @IsOptional()
    @IsString({ message: 'audioUrl phải là chuỗi kí tự' })
    audioUrl?: string;

    @ApiPropertyOptional({ example: 'https://image.example.com/hello.jpg' })
    @IsOptional()
    @IsString({ message: 'imageUrl phải là chuỗi kí tự' })
    imageUrl?: string;

    @ApiPropertyOptional({ example: ['greeting', 'basic'] })
    @IsOptional()
    @IsArray({ message: 'tags phải là mảng' })
    @ArrayMaxSize(NOTE_CONSTANTS.TAG_MAX, { message: 'Không được quá 20 tags' })
    @IsString({ each: true, message: 'Mỗi tag phải là chuỗi kí tự' })
    @MaxLength(NOTE_CONSTANTS.TAG_MAX_LENGTH, { each: true, message: 'Tag không được quá 50 kí tự' })
    @Transform(({ value }) => value?.map((v: string) => v.trim().toLowerCase()))
    tags?: string[];

    @ApiPropertyOptional({ example: { 'Gender': 'Neuter' } })
    @IsOptional()
    @IsObject({ message: 'fields phải là object' })
    fields?: Record<string, unknown>;
}

export class UpdateNoteDto {
    @ApiPropertyOptional({ example: 'hello' })
    @IsOptional()
    @IsString({ message: 'word phải là chuỗi kí tự' })
    @Transform(({ value }) => value?.trim())
    word?: string;

    @ApiPropertyOptional({ example: 'xin chào' })
    @IsOptional()
    @IsString({ message: 'meaning phải là chuỗi kí tự' })
    @Transform(({ value }) => value?.trim())
    meaning?: string;

    @ApiPropertyOptional({ example: '/həˈloʊ/' })
    @IsOptional()
    @IsString({ message: 'ipa phải là chuỗi kí tự' })
    @Transform(({ value }) => value?.trim())
    ipa?: string;

    @ApiPropertyOptional({ enum: PartOfSpeech, example: 'NOUN' })
    @IsOptional()
    @IsEnum(PartOfSpeech, { message: 'Từ loại không hợp lệ' })
    partOfSpeech?: PartOfSpeech;

    @ApiPropertyOptional({ example: 'Hello, how are you?' })
    @IsOptional()
    @IsString({ message: 'example phải là chuỗi kí tự' })
    @Transform(({ value }) => value?.trim())
    example?: string;

    @ApiPropertyOptional({ example: 'https://audio.example.com/hello.mp3' })
    @IsOptional()
    @IsString({ message: 'audioUrl phải là chuỗi kí tự' })
    audioUrl?: string;

    @ApiPropertyOptional({ example: null })
    @IsOptional()
    imageUrl?: string | null;

    @ApiPropertyOptional({ example: ['greeting', 'basic'] })
    @IsOptional()
    @IsArray({ message: 'tags phải là mảng' })
    @ArrayMaxSize(NOTE_CONSTANTS.TAG_MAX, { message: 'Không được quá 20 tags' })
    @IsString({ each: true, message: 'Mỗi tag phải là chuỗi kí tự' })
    @MaxLength(NOTE_CONSTANTS.TAG_MAX_LENGTH, { each: true, message: 'Tag không được quá 50 kí tự' })
    @Transform(({ value }) => value?.map((v: string) => v.trim().toLowerCase()))
    tags?: string[];

    @ApiPropertyOptional({ example: { 'Gender': 'Neuter' } })
    @IsOptional()
    @IsObject({ message: 'fields phải là object' })
    fields?: Record<string, unknown>;
}

export class NoteResponseDto {
    @ApiProperty({ example: 'uuid' })
    id: string;

    @ApiProperty({ example: 'uuid' })
    deckId: string;

    @ApiProperty({ example: 'uuid' })
    templateId: string;

    @ApiProperty({ example: 'en' })
    languageId: string;

    @ApiPropertyOptional({ example: 'hello' })
    word?: string;

    @ApiPropertyOptional({ example: 'xin chào' })
    meaning?: string;

    @ApiPropertyOptional({ example: '/həˈloʊ/' })
    ipa?: string;

    @ApiPropertyOptional({ enum: PartOfSpeech, example: 'NOUN' })
    partOfSpeech?: PartOfSpeech;

    @ApiPropertyOptional({ example: 'Hello, how are you?' })
    example?: string;

    @ApiPropertyOptional({ example: 'https://audio.example.com/hello.mp3' })
    audioUrl?: string;

    @ApiPropertyOptional({ example: 'https://image.example.com/hello.jpg' })
    imageUrl?: string;

    @ApiProperty({ example: ['greeting'] })
    tags: string[];

    @ApiProperty({ example: {} })
    fields: Record<string, unknown>;

    @ApiProperty({ example: '2026-06-16T10:00:00.000Z' })
    createdAt: Date;

    @ApiProperty({ example: '2026-06-16T10:00:00.000Z' })
    updatedAt: Date;
}

// ─── Batch ─────────────────────────────────────────────────

export class BatchUpsertNoteItem {
    @ApiPropertyOptional({ example: 'uuid', description: 'Có để update, không có để tạo mới' })
    @IsOptional()
    @IsString({ message: 'id phải là chuỗi kí tự' })
    id?: string;

    @ApiProperty({ example: 'uuid' })
    @IsString({ message: 'templateId phải là chuỗi kí tự' })
    @IsNotEmpty({ message: 'templateId không được để trống' })
    templateId: string;

    @ApiProperty({ example: 'en' })
    @IsString({ message: 'languageId phải là chuỗi kí tự' })
    @IsNotEmpty({ message: 'languageId không được để trống' })
    languageId: string;

    @ApiPropertyOptional({ example: 'hello' })
    @IsOptional()
    @IsString({ message: 'word phải là chuỗi kí tự' })
    @Transform(({ value }) => value?.trim())
    word?: string;

    @ApiPropertyOptional({ example: 'xin chào' })
    @IsOptional()
    @IsString({ message: 'meaning phải là chuỗi kí tự' })
    @Transform(({ value }) => value?.trim())
    meaning?: string;

    @ApiPropertyOptional({ example: '/həˈloʊ/' })
    @IsOptional()
    @IsString({ message: 'ipa phải là chuỗi kí tự' })
    @Transform(({ value }) => value?.trim())
    ipa?: string;

    @ApiPropertyOptional({ enum: PartOfSpeech, example: 'NOUN' })
    @IsOptional()
    @IsEnum(PartOfSpeech, { message: 'Từ loại không hợp lệ' })
    partOfSpeech?: PartOfSpeech;

    @ApiPropertyOptional({ example: 'Hello, how are you?' })
    @IsOptional()
    @IsString({ message: 'example phải là chuỗi kí tự' })
    @Transform(({ value }) => value?.trim())
    example?: string;

    @ApiPropertyOptional({ example: 'https://audio.example.com/hello.mp3' })
    @IsOptional()
    @IsString({ message: 'audioUrl phải là chuỗi kí tự' })
    audioUrl?: string;

    @ApiPropertyOptional({ example: 'https://image.example.com/hello.jpg' })
    @IsOptional()
    @IsString({ message: 'imageUrl phải là chuỗi kí tự' })
    imageUrl?: string;

    @ApiPropertyOptional({ example: ['greeting', 'basic'] })
    @IsOptional()
    @IsArray({ message: 'tags phải là mảng' })
    @ArrayMaxSize(NOTE_CONSTANTS.TAG_MAX, { message: 'Không được quá 20 tags' })
    @IsString({ each: true, message: 'Mỗi tag phải là chuỗi kí tự' })
    @MaxLength(NOTE_CONSTANTS.TAG_MAX_LENGTH, { each: true, message: 'Tag không được quá 50 kí tự' })
    @Transform(({ value }) => value?.map((v: string) => v.trim().toLowerCase()))
    tags?: string[];

    @ApiPropertyOptional({ example: { 'Gender': 'Neuter' } })
    @IsOptional()
    @IsObject({ message: 'fields phải là object' })
    fields?: Record<string, unknown>;
}

export class BatchUpsertNotesDto {
    @ApiProperty({ type: [BatchUpsertNoteItem] })
    @IsArray({ message: 'notes phải là mảng' })
    @ArrayMinSize(1, { message: 'Phải có ít nhất 1 note' })
    @ValidateNested({ each: true })
    @Type(() => BatchUpsertNoteItem)
    notes: BatchUpsertNoteItem[];
}

// ─── Preview ───────────────────────────────────────────────

export class PreviewItemDto {
    @ApiProperty({ example: 'hello' })
    @IsString({ message: 'text phải là chuỗi kí tự' })
    @IsNotEmpty({ message: 'text không được để trống' })
    text: string;

    @ApiPropertyOptional({ example: 'en', description: 'Gợi ý ngôn ngữ, có sẽ bỏ qua detect' })
    @IsOptional()
    @IsString({ message: 'languageId phải là chuỗi kí tự' })
    languageId?: string;

    @ApiPropertyOptional({ example: 'https://audio.example.com/hello.mp3', description: 'Audio URL có sẵn, có sẽ bỏ qua cache' })
    @IsOptional()
    @IsString({ message: 'audioUrl phải là chuỗi kí tự' })
    audioUrl?: string;
}

export class PreviewRequestDto {
    @ApiProperty({ type: [PreviewItemDto], example: [{ text: 'hello' }, { text: 'xin chào', languageId: 'vi' }] })
    @IsArray({ message: 'items phải là mảng' })
    @ArrayMinSize(1, { message: 'Phải có ít nhất 1 item' })
    @ValidateNested({ each: true })
    @Type(() => PreviewItemDto)
    items: PreviewItemDto[];
}

export class PreviewResponseItemDto {
    @ApiProperty({ example: 'hello' })
    text: string;

    @ApiProperty({ example: 'en' })
    detectedLanguage: string;

    @ApiPropertyOptional({ example: 'https://...mp3', nullable: true })
    audioUrl: string | null;
}
