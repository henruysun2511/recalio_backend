import {
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  IsUUID,
  IsBoolean,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { POST_COMMENT_CONSTANTS } from './post-comment.constant';
import { PaginationDto } from '../../common/dtos/pagination.dto';

export class CreateCommentDto {
  @ApiProperty({ example: 'Bài viết rất hữu ích, cảm ơn tác giả!' })
  @IsString()
  @MinLength(1)
  @MaxLength(POST_COMMENT_CONSTANTS.CONTENT_MAX_LENGTH)
  @Transform(({ value }) => value?.trim())
  content: string;

  @ApiPropertyOptional({ example: 'uuid-parent-comment' })
  @IsOptional()
  @IsUUID('4')
  parentId?: string;
}

export class UpdateCommentDto {
  @ApiProperty({ example: 'Đã chỉnh sửa nội dung comment' })
  @IsString()
  @MinLength(1)
  @MaxLength(POST_COMMENT_CONSTANTS.CONTENT_MAX_LENGTH)
  @Transform(({ value }) => value?.trim())
  content: string;
}

export class CommentQueryDto extends PaginationDto {}
