import { Controller, Get, Post, Patch, Delete, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { NoteService } from './note.service';
import { CreateNoteDto, UpdateNoteDto, NoteResponseDto, BatchUpsertNotesDto } from './note.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import { SwaggerDoc } from '../../common/swagger/swagger-doc';
import { PaginationDto } from '../../common/dtos/pagination.dto';

@ApiTags('Notes')
@Controller('notes')
export class NoteController {
    constructor(private readonly service: NoteService) { }

    @Post('decks/:deckId')
    @ApiBearerAuth()
    @ResponseMessage('Tạo note thành công')
    @SwaggerDoc({ summary: 'Create a note', bodyType: CreateNoteDto, responseType: NoteResponseDto, status: 201 })
    async create(@CurrentUser('id') userId: string, @Param('deckId') deckId: string, @Body() dto: CreateNoteDto) {
        return this.service.create(userId, deckId, dto);
    }

    @Post('decks/:deckId/batch')
    @ApiBearerAuth()
    @ResponseMessage('Tạo/Cập nhật hàng loạt note thành công')
    @SwaggerDoc({ summary: 'Batch upsert notes', bodyType: BatchUpsertNotesDto, responseType: NoteResponseDto, isArray: true, status: 201 })
    async batchUpsert(@CurrentUser('id') userId: string, @Param('deckId') deckId: string, @Body() dto: BatchUpsertNotesDto) {
        return this.service.batchUpsert(userId, deckId, dto);
    }

    @Get('decks/:deckId')
    @Public()
    @ResponseMessage('Lấy danh sách note thành công')
    @SwaggerDoc({ summary: 'List notes of a deck', responseType: NoteResponseDto, isArray: true })
    async findByDeck(
        @CurrentUser('id') userId: string | undefined,
        @Param('deckId') deckId: string,
        @Query() dto: PaginationDto,
    ) {
        return this.service.findByDeck(userId, deckId, dto);
    }

    @Patch(':id')
    @ApiBearerAuth()
    @ResponseMessage('Cập nhật note thành công')
    @SwaggerDoc({ summary: 'Update a note', bodyType: UpdateNoteDto, responseType: NoteResponseDto })
    async update(@CurrentUser('id') userId: string, @Param('id') id: string, @Body() dto: UpdateNoteDto) {
        return this.service.update(userId, id, dto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiBearerAuth()
    @ResponseMessage('Xoá note thành công')
    @SwaggerDoc({ summary: 'Delete a note' })
    async delete(@CurrentUser('id') userId: string, @Param('id') id: string) {
        await this.service.delete(userId, id);
    }
}
