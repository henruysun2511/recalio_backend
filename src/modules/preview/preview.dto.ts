import { IsString, IsArray, IsOptional, IsNotEmpty, ArrayMinSize, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PreviewItemDto {
    @ApiProperty({ example: 'hello' })
    @IsString({ message: 'text phải là chuỗi kí tự' })
    @IsNotEmpty({ message: 'text không được để trống' })
    text: string;

    @ApiPropertyOptional({ example: 'en', description: 'Gợi ý ngôn ngữ, nếu có sẽ bỏ qua detect' })
    @IsOptional()
    @IsString({ message: 'languageId phải là chuỗi kí tự' })
    languageId?: string;
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

    @ApiProperty({ example: 'en', description: 'ISO 639-1 code' })
    detectedLanguage: string;

    @ApiPropertyOptional({ example: 'https://audio.example.com/hello.mp3', nullable: true })
    audioUrl: string | null;
}

export class PreviewResponseDto {
    @ApiProperty({ type: [PreviewResponseItemDto] })
    items: PreviewResponseItemDto[];
}
