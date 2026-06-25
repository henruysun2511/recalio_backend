import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PostService } from './post.service';
import { CreatePostDto, UpdatePostDto, PostQueryDto, ReportPostDto, BanPostDto } from './post.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import { SwaggerDoc } from '../../common/swagger/swagger-doc';

@ApiTags('Posts')
@ApiBearerAuth()
@Controller('posts')
export class PostController {
    constructor(private readonly service: PostService) { }

    @Post()
    @ResponseMessage('Tạo bài viết thành công')
    @SwaggerDoc({ summary: 'Create a post', bodyType: CreatePostDto })
    async create(@CurrentUser('id') userId: string, @Body() dto: CreatePostDto) {
        return this.service.create(userId, dto);
    }

    @Get()
    @SwaggerDoc({ summary: 'List published posts' })
    async findAll(@Query() dto: PostQueryDto) {
        return this.service.findAll(dto);
    }

    @Patch(':id')
    @ResponseMessage('Cập nhật bài viết thành công')
    @SwaggerDoc({ summary: 'Update own post', bodyType: UpdatePostDto })
    async update(@CurrentUser('id') userId: string, @Param('id') id: string, @Body() dto: UpdatePostDto) {
        return this.service.update(userId, id, dto);
    }

    @Delete(':id')
    @ResponseMessage('Xoá bài viết thành công')
    @SwaggerDoc({ summary: 'Delete own post' })
    async delete(@CurrentUser('id') userId: string, @Param('id') id: string) {
        return this.service.delete(userId, id);
    }

    @Post(':id/like')
    @ResponseMessage('Cập nhật cảm xúc bài viết thành công')
    @SwaggerDoc({ summary: 'Like/unlike a post' })
    async toggleLike(@CurrentUser('id') userId: string, @Param('id') id: string) {
        return this.service.toggleLike(userId, id);
    }

    @Post(':id/report')
    @ResponseMessage('Báo cáo bài viết thành công')
    @SwaggerDoc({ summary: 'Report a post', bodyType: ReportPostDto })
    async report(@CurrentUser('id') userId: string, @Param('id') id: string, @Body() dto: ReportPostDto) {
        return this.service.report(userId, id, dto);
    }

    @Get('admin/all')
    @Roles('ADMIN')
    @ResponseMessage('Lấy danh sách bài viết thành công')
    @SwaggerDoc({ summary: 'List all posts (admin)' })
    async findAllAdmin(@Query() dto: PostQueryDto) {
        return this.service.findAllAdmin(dto);
    }

    @Patch(':id/ban')
    @Roles('ADMIN')
    @ResponseMessage('Cập nhật trạng thái bài viết thành công')
    @SwaggerDoc({ summary: 'Ban/unban a post (admin)', bodyType: BanPostDto })
    async ban(@Param('id') id: string, @Body() dto: BanPostDto) {
        return this.service.ban(id, dto);
    }
}
