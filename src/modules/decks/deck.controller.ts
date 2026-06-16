import { Controller, Get, Post, Patch, Delete, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { DeckService } from './deck.service';
import { CreateDeckDto, UpdateDeckDto, MoveDeckDto, QueryDeckDto, DeckResponseDto } from './deck.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { SwaggerDoc } from '../../common/swagger/swagger-doc';

@ApiTags('Decks')
@ApiBearerAuth()
@Controller('decks')
export class DeckController {
    constructor(private readonly service: DeckService) { }

    @Get()
    @Public()
    @ResponseMessage('Lấy danh sách deck công khai thành công')
    @SwaggerDoc({ summary: 'List public decks', responseType: DeckResponseDto, isArray: true })
    async getPublicList(@Query() dto: QueryDeckDto) {
        return this.service.getPublicList(dto);
    }

    @Get('me')
    @ResponseMessage('Lấy danh sách deck của tôi thành công')
    @SwaggerDoc({ summary: 'List my decks', responseType: DeckResponseDto, isArray: true })
    async getMyList(@CurrentUser('id') userId: string, @Query() dto: QueryDeckDto) {
        return this.service.getMyList(userId, dto);
    }

    @Get('archived')
    @ResponseMessage('Lấy danh sách deck đã lưu trữ thành công')
    @SwaggerDoc({ summary: 'List archived decks', responseType: DeckResponseDto, isArray: true })
    async getArchivedList(@CurrentUser('id') userId: string, @Query() dto: QueryDeckDto) {
        return this.service.getArchivedList(userId, dto);
    }

    @Get('cloned')
    @ResponseMessage('Lấy danh sách deck đã clone thành công')
    @SwaggerDoc({ summary: 'List cloned decks', responseType: DeckResponseDto, isArray: true })
    async getClonedList(@CurrentUser('id') userId: string, @Query() dto: QueryDeckDto) {
        return this.service.getClonedList(userId, dto);
    }

    @Get(':id')
    @ResponseMessage('Lấy thông tin deck thành công')
    @SwaggerDoc({ summary: 'Get deck by id', responseType: DeckResponseDto })
    async getById(@CurrentUser('id') userId: string | undefined, @Param('id') id: string) {
        return this.service.getById(id, userId);
    }

    @Post()
    @ResponseMessage('Tạo deck thành công')
    @SwaggerDoc({ summary: 'Create deck', bodyType: CreateDeckDto, responseType: DeckResponseDto, status: 201 })
    async create(@CurrentUser('id') userId: string, @Body() dto: CreateDeckDto) {
        return this.service.create(userId, dto);
    }

    @Patch(':id')
    @ResponseMessage('Cập nhật deck thành công')
    @SwaggerDoc({ summary: 'Update deck (owner only)', bodyType: UpdateDeckDto, responseType: DeckResponseDto })
    async update(@CurrentUser('id') userId: string, @Param('id') id: string, @Body() dto: UpdateDeckDto) {
        return this.service.update(userId, id, dto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ResponseMessage('Xoá deck thành công')
    @SwaggerDoc({ summary: 'Delete deck (owner only)' })
    async delete(@CurrentUser('id') userId: string, @Param('id') id: string) {
        await this.service.delete(userId, id);
    }

    @Patch(':id/move')
    @ResponseMessage('Di chuyển deck thành công')
    @SwaggerDoc({ summary: 'Move deck to folder (owner only)', bodyType: MoveDeckDto, responseType: DeckResponseDto })
    async move(@CurrentUser('id') userId: string, @Param('id') id: string, @Body() dto: MoveDeckDto) {
        return this.service.move(userId, id, dto);
    }

    @Post(':id/clone')
    @ResponseMessage('Clone deck thành công')
    @SwaggerDoc({ summary: 'Clone deck', responseType: DeckResponseDto, status: 201 })
    async clone(@CurrentUser('id') userId: string, @Param('id') id: string) {
        return this.service.clone(userId, id);
    }

    @Patch(':id/ban')
    @Roles(UserRole.ADMIN)
    @ResponseMessage('Cập nhật trạng thái cấm deck thành công')
    @SwaggerDoc({ summary: 'Toggle ban deck (admin only)', responseType: DeckResponseDto })
    async toggleBan(@Param('id') id: string) {
        return this.service.toggleBan(id);
    }
}
