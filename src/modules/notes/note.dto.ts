import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsInt,
  MaxLength,
  ArrayMaxSize,
  IsObject,
  ArrayMinSize,
  ValidateNested,
  IsIn,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PartOfSpeech, NoteTemplateType } from '@prisma/client';
import { NOTE_CONSTANTS } from './note.constant';
import { SearchDto } from '../../common/dtos/search.dto';

// ─── Query ───────────────────────────────────────────────

export class NoteQueryDto extends SearchDto {
  @ApiPropertyOptional({ example: 'createdAt' })
  @IsOptional()
  @IsString({ message: 'sort phải là chuỗi kí tự' })
  @IsIn(NOTE_CONSTANTS.SORT_FIELDS, { message: 'sort không hợp lệ' })
  sort?: 'createdAt' | 'updatedAt' | 'word' = 'createdAt';

  @ApiPropertyOptional({ example: 'uuid' })
  @IsOptional()
  @IsString({ message: 'templateId phải là chuỗi kí tự' })
  templateId?: string;
}

// ─── Occlusion Mask ──────────────────────────────────────

export class OcclusionMaskDto {
  @ApiProperty({ example: 12.5 })
  @Type(() => Number)
  @IsNumber({}, { message: 'x phải là số' })
  x: number;

  @ApiProperty({ example: 20 })
  @Type(() => Number)
  @IsNumber({}, { message: 'y phải là số' })
  y: number;

  @ApiProperty({ example: 15 })
  @Type(() => Number)
  @IsNumber({}, { message: 'width phải là số' })
  width: number;

  @ApiProperty({ example: 8 })
  @Type(() => Number)
  @IsNumber({}, { message: 'height phải là số' })
  height: number;

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt({ message: 'groupIndex phải là số nguyên' })
  groupIndex: number;

  @ApiPropertyOptional({ example: 'Nhân' })
  @IsOptional()
  @IsString({ message: 'label phải là chuỗi kí tự' })
  label?: string;
}

// ─── Update (PATCH /notes/:id) ───────────────────────────

export class UpdateNoteDto {
  @ApiPropertyOptional({ example: 'uuid' })
  @IsOptional()
  @IsString({ message: 'templateId phải là chuỗi kí tự' })
  templateId?: string;

  @ApiPropertyOptional({ example: 'en' })
  @IsOptional()
  @IsString({ message: 'languageId phải là chuỗi kí tự' })
  languageId?: string;

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
  @MaxLength(NOTE_CONSTANTS.TAG_MAX_LENGTH, {
    each: true,
    message: 'Tag không được quá 50 kí tự',
  })
  @Transform(({ value }) => value?.map((v: string) => v.trim().toLowerCase()))
  tags?: string[];

  @ApiPropertyOptional({ example: { Gender: 'Neuter' } })
  @IsOptional()
  @IsObject({ message: 'fields phải là object' })
  fields?: Record<string, unknown>;

  @ApiPropertyOptional({ type: [OcclusionMaskDto] })
  @IsOptional()
  @IsArray({ message: 'masks phải là mảng' })
  @ValidateNested({ each: true })
  @Type(() => OcclusionMaskDto)
  masks?: OcclusionMaskDto[];
}

// ─── Response ────────────────────────────────────────────

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

  @ApiPropertyOptional({ enum: NoteTemplateType, example: 'BASIC' })
  templateType?: NoteTemplateType;

  @ApiPropertyOptional({ type: [OcclusionMaskDto] })
  occlusionMasks?: OcclusionMaskDto[];

  @ApiProperty({ example: '2026-06-16T10:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-06-16T10:00:00.000Z' })
  updatedAt: Date;
}

// ─── Preview ─────────────────────────────────────────────

export class PreviewWordDto {
  @ApiProperty({ example: 'hello' })
  @IsString({ message: 'word phải là chuỗi kí tự' })
  @IsNotEmpty({ message: 'word không được để trống' })
  word: string;

  @ApiPropertyOptional({ example: 'en', description: 'Gợi ý ngôn ngữ' })
  @IsOptional()
  @IsString({ message: 'detectedLanguage phải là chuỗi kí tự' })
  detectedLanguage?: string;

  @ApiPropertyOptional({
    example: 'https://...mp3',
    description: 'Audio do người dùng cung cấp',
  })
  @IsOptional()
  @IsString({ message: 'audioUrl phải là chuỗi kí tự' })
  userAudioUrl?: string;
}

export class PreviewNoteDto {
  @ApiProperty({ type: [PreviewWordDto] })
  @IsArray({ message: 'words phải là mảng' })
  @ArrayMinSize(1, { message: 'Phải có ít nhất 1 từ' })
  @ValidateNested({ each: true })
  @Type(() => PreviewWordDto)
  words: PreviewWordDto[];
}

// ─── Confirm ─────────────────────────────────────────────

export class ConfirmWordDto {
  @ApiPropertyOptional({
    example: 'uuid',
    description: 'Có để update, không có để tạo mới',
  })
  @IsOptional()
  @IsString({ message: 'id phải là chuỗi kí tự' })
  id?: string;

  @ApiPropertyOptional({ example: 'uuid' })
  @IsOptional()
  @IsString({ message: 'templateId phải là chuỗi kí tự' })
  templateId?: string;

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
  @MaxLength(NOTE_CONSTANTS.TAG_MAX_LENGTH, {
    each: true,
    message: 'Tag không được quá 50 kí tự',
  })
  @Transform(({ value }) => value?.map((v: string) => v.trim().toLowerCase()))
  tags?: string[];

  @ApiPropertyOptional({ example: { Gender: 'Neuter' } })
  @IsOptional()
  @IsObject({ message: 'fields phải là object' })
  fields?: Record<string, unknown>;

  @ApiPropertyOptional({ type: [OcclusionMaskDto] })
  @IsOptional()
  @IsArray({ message: 'masks phải là mảng' })
  @ValidateNested({ each: true })
  @Type(() => OcclusionMaskDto)
  masks?: OcclusionMaskDto[];
}

export class ConfirmNoteDto {
  @ApiProperty({ example: 'uuid' })
  @IsString({ message: 'deckId phải là chuỗi kí tự' })
  @IsNotEmpty({ message: 'deckId không được để trống' })
  deckId: string;

  @ApiProperty({ type: [ConfirmWordDto] })
  @IsArray({ message: 'words phải là mảng' })
  @ArrayMinSize(1, { message: 'Phải có ít nhất 1 từ' })
  @ValidateNested({ each: true })
  @Type(() => ConfirmWordDto)
  words: ConfirmWordDto[];
}

// ─── Document Notes ──────────────────────────────────────

export class DocumentNoteInputDto {
  @ApiProperty({
    example: "Newton's First Law of Motion",
    description: 'Title of the chunk (sẽ lưu vào word)',
  })
  @IsString({ message: 'word phải là chuỗi kí tự' })
  @IsNotEmpty({ message: 'word không được để trống' })
  word: string;

  @ApiProperty({
    example:
      'An object remains at rest or in uniform motion unless acted upon by an external force',
    description: 'Summary (sẽ lưu vào meaning)',
  })
  @IsString({ message: 'meaning phải là chuỗi kí tự' })
  meaning: string;

  @ApiProperty({
    example:
      'A hockey puck sliding on ice continues moving until friction gradually brings it to a stop',
    description: 'Key sentence (sẽ lưu vào example)',
  })
  @IsString({ message: 'example phải là chuỗi kí tự' })
  example: string;

  @ApiProperty({
    example:
      'A hockey puck sliding on ice continues moving until friction gradually brings it to a stop',
    description: 'Original chunk text',
  })
  @IsString({ message: 'chunk phải là chuỗi kí tự' })
  chunk: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  pageNumber?: number;

  @ApiProperty({ example: 0 })
  @Type(() => Number)
  orderIndex: number;
}

export class CreateDocumentNotesDto {
  @ApiProperty({ example: 'uuid' })
  @IsString({ message: 'deckId phải là chuỗi kí tự' })
  @IsNotEmpty({ message: 'deckId không được để trống' })
  deckId: string;

  @ApiProperty({ example: 'en' })
  @IsString({ message: 'languageId phải là chuỗi kí tự' })
  @IsNotEmpty({ message: 'languageId không được để trống' })
  languageId: string;

  @ApiProperty({ example: 'uuid' })
  @IsString({ message: 'templateId phải là chuỗi kí tự' })
  @IsNotEmpty({ message: 'templateId không được để trống' })
  templateId: string;

  @ApiProperty({ example: 'document.pdf' })
  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ message: 'fileName phải là chuỗi kí tự' })
  fileName?: string;

  @ApiProperty({ type: [DocumentNoteInputDto] })
  @IsArray({ message: 'items phải là mảng' })
  @ArrayMinSize(1, { message: 'Phải có ít nhất 1 item' })
  @ValidateNested({ each: true })
  @Type(() => DocumentNoteInputDto)
  items: DocumentNoteInputDto[];
}
