import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PostCommentService } from './post-comment.service';
import { CreateCommentDto, UpdateCommentDto, CommentQueryDto } from './post-comment.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import { SwaggerDoc } from '../../common/swagger/swagger-doc';

@ApiTags('Post Comments')
@ApiBearerAuth()
@Controller()
export class PostCommentController {
    constructor(private readonly service: PostCommentService) { }

    @Get('posts/:postId/comments')
    @ResponseMessage('Lấy danh sách bình luận thành công')
    @SwaggerDoc({ summary: 'List comments of a post' })
    async findByPost(@Param('postId') postId: string, @Query() dto: CommentQueryDto) {
        return this.service.findByPost(postId, dto);
    }

    @Post('posts/:postId/comments')
    @ResponseMessage('Thêm bình luận thành công')
    @SwaggerDoc({ summary: 'Create a comment on a post', bodyType: CreateCommentDto })
    async create(@CurrentUser('id') userId: string, @Param('postId') postId: string, @Body() dto: CreateCommentDto) {
        return this.service.create(userId, postId, dto);
    }

    @Patch('comments/:id')
    @ResponseMessage('Cập nhật bình luận thành công')
    @SwaggerDoc({ summary: 'Update own comment', bodyType: UpdateCommentDto })
    async update(@CurrentUser('id') userId: string, @Param('id') id: string, @Body() dto: UpdateCommentDto) {
        return this.service.update(userId, id, dto);
    }

    @Delete('comments/:id')
    @ResponseMessage('Xoá bình luận thành công')
    @SwaggerDoc({ summary: 'Delete own comment' })
    async delete(@CurrentUser('id') userId: string, @Param('id') id: string) {
        return this.service.delete(userId, id);
    }

    @Post('comments/:id/like')
    @ResponseMessage('Cập nhật cảm xúc bình luận thành công')
    @SwaggerDoc({ summary: 'Like/unlike a comment' })
    async toggleLike(@CurrentUser('id') userId: string, @Param('id') id: string) {
        return this.service.toggleLike(userId, id);
    }
}
