import { IsString, IsOptional, IsInt, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { AI_CONSTANTS } from './ai.constant';

export class ExtractWordsDto {
  @ApiProperty({
    example:
      'Climate change is one of the most pressing issues facing humanity today.',
  })
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
  @Max(AI_CONSTANTS.MAX_NOTES, {
    message: `count tối đa là ${AI_CONSTANTS.MAX_NOTES}`,
  })
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

  @ApiProperty({
    example: 'Climate change is one of the most pressing issues.',
  })
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

export class RelatedNotesDto {
  @ApiProperty({ example: 'happy' })
  @IsString({ message: 'word phải là chuỗi kí tự' })
  word: string;

  @ApiProperty({ example: 'en' })
  @IsString({ message: 'languageId phải là chuỗi kí tự' })
  languageId: string;
}

export class RelatedNotesResponseDto {
  @ApiProperty({ type: [AiNoteDto], description: 'Synonyms of the given word' })
  synonyms: AiNoteDto[];

  @ApiProperty({ type: [AiNoteDto], description: 'Antonyms of the given word' })
  antonyms: AiNoteDto[];
}

export class ProcessDocumentNoteDto {
  @ApiProperty({ example: "Newton's First Law of Motion" })
  word: string;

  @ApiProperty({
    example:
      'An object remains at rest or in uniform motion unless acted upon by an external force',
  })
  meaning: string;

  @ApiProperty({ example: null })
  ipa: string | null;

  @ApiProperty({
    example:
      'A hockey puck sliding on ice continues moving until friction gradually brings it to a stop',
  })
  example: string;

  @ApiProperty({ example: 'PHRASE' })
  partOfSpeech: string;

  @ApiProperty({ example: 3 })
  difficulty: number;

  @ApiProperty({ example: ['physics', 'mechanics'] })
  tags: string[];
}

export class ProcessDocumentDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'PDF file (max 2 pages)',
  })
  file: any;
}

export type ProcessDocumentResponseDto = ProcessDocumentNoteDto[];

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
  @ApiProperty({
    example: 'https://res.cloudinary.com/.../image.jpg',
    required: false,
  })
  imageUrl?: string;

  @ApiProperty({ type: [DetectObjectDto] })
  objects: DetectObjectDto[];

  @ApiProperty({
    type: [AiNoteDto],
    description: 'Vocabulary notes for detected objects',
  })
  notes: AiNoteDto[];
}
