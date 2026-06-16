import { IsString, IsOptional, IsEnum, IsArray, IsNotEmpty, MaxLength, ArrayMinSize, ArrayMaxSize, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NoteTemplateType } from '@prisma/client';
import { NOTE_TEMPLATE_CONSTANTS } from './note-template.constant';

// ─── Card Template (định nghĩa trước vì NoteTemplate DTO tham chiếu) ─

export class CreateCardTemplateDto {
    @ApiProperty({ example: 'Forward' })
    @IsString({ message: 'Tên card template phải là chuỗi kí tự' })
    @IsNotEmpty({ message: 'Tên card template không được để trống' })
    @MaxLength(NOTE_TEMPLATE_CONSTANTS.CARD_TEMPLATE_NAME_MAX_LENGTH, { message: 'Tên card template không được quá 100 kí tự' })
    @Transform(({ value }) => value?.trim())
    name: string;

    @ApiProperty({ example: '{{Word}}' })
    @IsString({ message: 'frontHtml phải là chuỗi kí tự' })
    @MaxLength(NOTE_TEMPLATE_CONSTANTS.HTML_MAX_LENGTH, { message: 'frontHtml không được quá 5000 kí tự' })
    @Transform(({ value }) => value?.trim())
    frontHtml: string;

    @ApiProperty({ example: '{{Meaning}}<hr>{{IPA}}' })
    @IsString({ message: 'backHtml phải là chuỗi kí tự' })
    @MaxLength(NOTE_TEMPLATE_CONSTANTS.HTML_MAX_LENGTH, { message: 'backHtml không được quá 5000 kí tự' })
    @Transform(({ value }) => value?.trim())
    backHtml: string;

    @ApiPropertyOptional({ example: '.card { font-size: 20px; }', default: '' })
    @IsOptional()
    @IsString({ message: 'css phải là chuỗi kí tự' })
    @MaxLength(NOTE_TEMPLATE_CONSTANTS.CSS_MAX_LENGTH, { message: 'css không được quá 5000 kí tự' })
    @Transform(({ value }) => value?.trim())
    css?: string;
}

export class UpdateCardTemplateDto {
    @ApiPropertyOptional({ example: 'Forward' })
    @IsOptional()
    @IsString({ message: 'Tên card template phải là chuỗi kí tự' })
    @MaxLength(NOTE_TEMPLATE_CONSTANTS.CARD_TEMPLATE_NAME_MAX_LENGTH, { message: 'Tên card template không được quá 100 kí tự' })
    @Transform(({ value }) => value?.trim())
    name?: string;

    @ApiPropertyOptional({ example: '{{Word}}' })
    @IsOptional()
    @IsString({ message: 'frontHtml phải là chuỗi kí tự' })
    @MaxLength(NOTE_TEMPLATE_CONSTANTS.HTML_MAX_LENGTH, { message: 'frontHtml không được quá 5000 kí tự' })
    @Transform(({ value }) => value?.trim())
    frontHtml?: string;

    @ApiPropertyOptional({ example: '{{Meaning}}<hr>{{IPA}}' })
    @IsOptional()
    @IsString({ message: 'backHtml phải là chuỗi kí tự' })
    @MaxLength(NOTE_TEMPLATE_CONSTANTS.HTML_MAX_LENGTH, { message: 'backHtml không được quá 5000 kí tự' })
    @Transform(({ value }) => value?.trim())
    backHtml?: string;

    @ApiPropertyOptional({ example: '.card { font-size: 20px; }' })
    @IsOptional()
    @IsString({ message: 'css phải là chuỗi kí tự' })
    @MaxLength(NOTE_TEMPLATE_CONSTANTS.CSS_MAX_LENGTH, { message: 'css không được quá 5000 kí tự' })
    @Transform(({ value }) => value?.trim())
    css?: string;
}

export class CardTemplateResponseDto {
    @ApiProperty({ example: 'uuid' })
    id: string;

    @ApiProperty({ example: 'uuid' })
    noteTemplateId: string;

    @ApiProperty({ example: 'Forward' })
    name: string;

    @ApiProperty({ example: '{{Word}}' })
    frontHtml: string;

    @ApiProperty({ example: '{{Meaning}}<hr>{{IPA}}' })
    backHtml: string;

    @ApiProperty({ example: '.card { font-size: 20px; }' })
    css: string;
}

// ─── Note Template ─────────────────────────────────────────

export class CreateNoteTemplateDto {
    @ApiProperty({ example: 'Basic' })
    @IsString({ message: 'Tên template phải là chuỗi kí tự' })
    @IsNotEmpty({ message: 'Tên template không được để trống' })
    @MaxLength(NOTE_TEMPLATE_CONSTANTS.NAME_MAX_LENGTH, { message: 'Tên template không được quá 100 kí tự' })
    @Transform(({ value }) => value?.trim())
    name: string;

    @ApiProperty({ enum: NoteTemplateType, example: 'BASIC' })
    @IsEnum(NoteTemplateType, { message: 'Loại template không hợp lệ' })
    type: NoteTemplateType;

    @ApiProperty({ example: ['Word', 'Meaning', 'IPA', 'Example'] })
    @IsArray({ message: 'fieldNames phải là mảng' })
    @ArrayMinSize(1, { message: 'Phải có ít nhất 1 field' })
    @ArrayMaxSize(NOTE_TEMPLATE_CONSTANTS.FIELD_NAMES_MAX, { message: 'Không được quá 20 field' })
    @IsString({ each: true, message: 'Mỗi field name phải là chuỗi kí tự' })
    @MinLength(1, { each: true, message: 'Tên field không được để trống' })
    @MaxLength(NOTE_TEMPLATE_CONSTANTS.FIELD_NAME_MAX_LENGTH, { each: true, message: 'Tên field không được quá 50 kí tự' })
    @Transform(({ value }) => value?.map((v: string) => v.trim()))
    fieldNames: string[];

    @ApiPropertyOptional({ type: [CreateCardTemplateDto], description: 'Card templates to create with this note template' })
    @IsOptional()
    @IsArray({ message: 'cardTemplates phải là mảng' })
    cardTemplates?: CreateCardTemplateDto[];
}

export class UpdateNoteTemplateDto {
    @ApiPropertyOptional({ example: 'Basic' })
    @IsOptional()
    @IsString({ message: 'Tên template phải là chuỗi kí tự' })
    @MaxLength(NOTE_TEMPLATE_CONSTANTS.NAME_MAX_LENGTH, { message: 'Tên template không được quá 100 kí tự' })
    @Transform(({ value }) => value?.trim())
    name?: string;

    @ApiPropertyOptional({ enum: NoteTemplateType })
    @IsOptional()
    @IsEnum(NoteTemplateType, { message: 'Loại template không hợp lệ' })
    type?: NoteTemplateType;

    @ApiPropertyOptional({ example: ['Word', 'Meaning', 'IPA', 'Example'] })
    @IsOptional()
    @IsArray({ message: 'fieldNames phải là mảng' })
    @ArrayMinSize(1, { message: 'Phải có ít nhất 1 field' })
    @ArrayMaxSize(NOTE_TEMPLATE_CONSTANTS.FIELD_NAMES_MAX, { message: 'Không được quá 20 field' })
    @IsString({ each: true, message: 'Mỗi field name phải là chuỗi kí tự' })
    @MinLength(1, { each: true, message: 'Tên field không được để trống' })
    @MaxLength(NOTE_TEMPLATE_CONSTANTS.FIELD_NAME_MAX_LENGTH, { each: true, message: 'Tên field không được quá 50 kí tự' })
    @Transform(({ value }) => value?.map((v: string) => v.trim()))
    fieldNames?: string[];
}

export class NoteTemplateResponseDto {
    @ApiProperty({ example: 'uuid' })
    id: string;

    @ApiProperty({ example: 'Basic' })
    name: string;

    @ApiProperty({ enum: NoteTemplateType, example: 'BASIC' })
    type: NoteTemplateType;

    @ApiProperty({ example: ['Word', 'Meaning', 'IPA', 'Example'] })
    fieldNames: string[];

    @ApiPropertyOptional({ type: [CardTemplateResponseDto] })
    cardTemplates?: CardTemplateResponseDto[];
}
