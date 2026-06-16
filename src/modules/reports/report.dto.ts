import { IsString, IsOptional, IsEnum, MinLength, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReportReason, ReportStatus } from '@prisma/client';
import { REPORT_CONSTANTS } from './report.constant';

export class CreateReportDto {
    @ApiProperty({ enum: ReportReason, example: 'SPAM' })
    @IsEnum(ReportReason, { message: 'Lý do không hợp lệ' })
    reason: ReportReason;

    @ApiPropertyOptional({ example: 'Deck này chứa nội dung spam' })
    @IsOptional()
    @IsString({ message: 'Mô tả phải là chuỗi kí tự' })
    @MinLength(1, { message: 'Mô tả không được để trống' })
    @MaxLength(REPORT_CONSTANTS.DESC_MAX_LENGTH, { message: 'Mô tả không được quá 1000 kí tự' })
    @Transform(({ value }) => value?.trim())
    description?: string;
}

export class UpdateReportStatusDto {
    @ApiProperty({ enum: ReportStatus, example: 'REVIEWED' })
    @IsEnum(ReportStatus, { message: 'Trạng thái không hợp lệ' })
    status: ReportStatus;
}

export class ReportDeckDto {
    @ApiProperty({ example: 'uuid' })
    id: string;

    @ApiProperty({ example: 'uuid' })
    deckId: string;

    @ApiProperty({ enum: ReportReason })
    reason: ReportReason;

    @ApiProperty({ example: 'Mô tả chi tiết', nullable: true })
    description: string | null;

    @ApiProperty({ enum: ReportStatus })
    status: ReportStatus;

    @ApiProperty({ example: '2026-06-16T10:00:00.000Z' })
    createdAt: Date;

    @ApiProperty({ example: '2026-06-16T10:00:00.000Z' })
    updatedAt: Date;
}

export class ReportAdminDto {
    @ApiProperty({ example: 'uuid' })
    id: string;

    @ApiProperty({ example: 'uuid' })
    deckId: string;

    @ApiProperty({ enum: ReportReason })
    reason: ReportReason;

    @ApiProperty({ example: 'Mô tả chi tiết', nullable: true })
    description: string | null;

    @ApiProperty({ enum: ReportStatus })
    status: ReportStatus;

    @ApiProperty({ example: '2026-06-16T10:00:00.000Z' })
    createdAt: Date;

    @ApiProperty({ example: '2026-06-16T10:00:00.000Z' })
    updatedAt: Date;

    @ApiProperty({ example: { id: 'uuid', username: 'john_doe', displayName: 'John Doe' } })
    reportedBy: Record<string, unknown>;

    @ApiProperty({ example: { id: 'uuid', name: 'English Vocabulary', isBanned: false } })
    deck: Record<string, unknown>;
}
