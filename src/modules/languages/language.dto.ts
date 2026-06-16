import { IsString, IsOptional, IsBoolean, IsNotEmpty, MaxLength, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LANGUAGE_CONSTANTS } from './language.constant';

export class CreateLanguageDto {
    @ApiProperty({ example: 'en', description: 'ISO 639-1 code' })
    @IsString({ message: 'Mã ngôn ngữ phải là chuỗi kí tự' })
    @IsNotEmpty({ message: 'Mã ngôn ngữ không được để trống' })
    @MinLength(2, { message: 'Mã ngôn ngữ phải có ít nhất 2 kí tự' })
    @MaxLength(5, { message: 'Mã ngôn ngữ không được quá 5 kí tự' })
    @Transform(({ value }) => value?.toLowerCase().trim())
    id: string;

    @ApiProperty({ example: 'English' })
    @IsString({ message: 'Tên ngôn ngữ phải là chuỗi kí tự' })
    @IsNotEmpty({ message: 'Tên ngôn ngữ không được để trống' })
    @MaxLength(LANGUAGE_CONSTANTS.NAME_MAX_LENGTH, { message: 'Tên ngôn ngữ không được quá 100 kí tự' })
    @Transform(({ value }) => value?.trim())
    name: string;

    @ApiProperty({ example: 'English' })
    @IsString({ message: 'Tên bản ngữ phải là chuỗi kí tự' })
    @IsNotEmpty({ message: 'Tên bản ngữ không được để trống' })
    @MaxLength(LANGUAGE_CONSTANTS.NAME_MAX_LENGTH, { message: 'Tên bản ngữ không được quá 100 kí tự' })
    @Transform(({ value }) => value?.trim())
    nativeName: string;

    @ApiProperty({ example: '🇬🇧' })
    @IsString({ message: 'Flag emoji phải là chuỗi kí tự' })
    @IsNotEmpty({ message: 'Flag emoji không được để trống' })
    @MaxLength(LANGUAGE_CONSTANTS.FLAG_EMOJI_MAX_LENGTH, { message: 'Flag emoji không được quá 10 kí tự' })
    @Transform(({ value }) => value?.trim())
    flagEmoji: string;

    @ApiPropertyOptional({ example: true, default: false })
    @IsOptional()
    @IsBoolean({ message: 'isSupported phải là boolean' })
    @Transform(({ value }) => value === true || value === 'true')
    isSupported?: boolean;
}

export class UpdateLanguageDto {
    @ApiPropertyOptional({ example: 'English' })
    @IsOptional()
    @IsString({ message: 'Tên ngôn ngữ phải là chuỗi kí tự' })
    @MaxLength(LANGUAGE_CONSTANTS.NAME_MAX_LENGTH, { message: 'Tên ngôn ngữ không được quá 100 kí tự' })
    @Transform(({ value }) => value?.trim())
    name?: string;

    @ApiPropertyOptional({ example: 'English' })
    @IsOptional()
    @IsString({ message: 'Tên bản ngữ phải là chuỗi kí tự' })
    @MaxLength(LANGUAGE_CONSTANTS.NAME_MAX_LENGTH, { message: 'Tên bản ngữ không được quá 100 kí tự' })
    @Transform(({ value }) => value?.trim())
    nativeName?: string;

    @ApiPropertyOptional({ example: '🇬🇧' })
    @IsOptional()
    @IsString({ message: 'Flag emoji phải là chuỗi kí tự' })
    @MaxLength(LANGUAGE_CONSTANTS.FLAG_EMOJI_MAX_LENGTH, { message: 'Flag emoji không được quá 10 kí tự' })
    @Transform(({ value }) => value?.trim())
    flagEmoji?: string;

    @ApiPropertyOptional({ example: true })
    @IsOptional()
    @IsBoolean({ message: 'isSupported phải là boolean' })
    @Transform(({ value }) => value === true || value === 'true')
    isSupported?: boolean;
}

export class LanguageResponseDto {
    @ApiProperty({ example: 'en' })
    id: string;

    @ApiProperty({ example: 'English' })
    name: string;

    @ApiProperty({ example: 'English' })
    nativeName: string;

    @ApiProperty({ example: '🇬🇧' })
    flagEmoji: string;

    @ApiProperty({ example: true })
    isSupported: boolean;
}
