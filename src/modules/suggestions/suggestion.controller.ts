import { Controller, Get, Post, Patch, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { SuggestionService } from './suggestion.service';
import { CreateSuggestionDto, SuggestionResponseDto } from './suggestion.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { SwaggerDoc } from '../../common/swagger/swagger-doc';
import { PaginationDto } from '../../common/dtos/pagination.dto';

@ApiTags('Suggestions')
@ApiBearerAuth()
@Controller('suggestions')
export class SuggestionController {
    constructor(private readonly service: SuggestionService) { }

    @Post()
    @ResponseMessage('Gửi góp ý thành công, cảm ơn bạn!')
    @SwaggerDoc({ summary: 'Send general feedback to website author', bodyType: CreateSuggestionDto, responseType: SuggestionResponseDto, status: 201 })
    async create(@CurrentUser('id') userId: string, @Body() dto: CreateSuggestionDto) {
        return this.service.create(userId, dto);
    }

    @Get()
    @Roles(UserRole.ADMIN)
    @ResponseMessage('Lấy danh sách góp ý thành công')
    @SwaggerDoc({ summary: 'List all suggestions (admin only)', responseType: SuggestionResponseDto, isArray: true })
    async findAll(@Query() dto: PaginationDto) {
        return this.service.findAll(dto);
    }

    @Patch(':id/read')
    @Roles(UserRole.ADMIN)
    @ResponseMessage('Đánh dấu góp ý đã đọc')
    @SwaggerDoc({ summary: 'Mark suggestion as read (admin only)' })
    async markAsRead(@CurrentUser('id') userId: string, @Param('id') id: string) {
        return this.service.markAsRead(userId, id);
    }
}
