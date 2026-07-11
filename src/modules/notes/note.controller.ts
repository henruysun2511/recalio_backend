import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { NoteService } from './note.service';
import {
  NoteResponseDto,
  UpdateNoteDto,
  PreviewNoteDto,
  ConfirmNoteDto,
  CreateDocumentNotesDto,
  NoteQueryDto,
} from './note.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import { SwaggerDoc } from '../../common/swagger/swagger-doc';
@ApiTags('Notes')
@Controller('notes')
export class NoteController {
  constructor(private readonly service: NoteService) {}

  @Get('decks/:deckId')
  @ResponseMessage('Lấy danh sách note thành công')
  @SwaggerDoc({
    summary: 'List notes of a deck',
    responseType: NoteResponseDto,
    isArray: true,
  })
  async findByDeck(
    @CurrentUser('id') userId: string,
    @Param('deckId') deckId: string,
    @Query() dto: NoteQueryDto,
  ) {
    return this.service.findByDeck(userId, deckId, dto);
  }

  @Post('preview')
  @Public()
  @ResponseMessage('Preview thành công')
  @SwaggerDoc({
    summary: 'Detect language & check audio cache (batch)',
    bodyType: PreviewNoteDto,
  })
  async preview(@Body() dto: PreviewNoteDto) {
    return this.service.preview(dto);
  }

  @Post('confirm')
  @ApiBearerAuth()
  @ResponseMessage('Đang xử lý từ vựng')
  @SwaggerDoc({
    summary: 'Create/update notes & queue audio processing',
    bodyType: ConfirmNoteDto,
    status: 202,
  })
  async confirm(
    @CurrentUser('id') userId: string,
    @Body() dto: ConfirmNoteDto,
  ) {
    return this.service.confirm(dto, userId);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ResponseMessage('Cập nhật note thành công')
  @SwaggerDoc({
    summary: 'Update a note',
    bodyType: UpdateNoteDto,
    responseType: NoteResponseDto,
  })
  async update(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateNoteDto,
  ) {
    return this.service.update(userId, id, dto);
  }

  @Post('from-document')
  @ApiBearerAuth()
  @ResponseMessage('Tạo notes từ tài liệu thành công')
  @SwaggerDoc({
    summary: 'Create notes and document notes from processed document',
    bodyType: CreateDocumentNotesDto,
  })
  @HttpCode(HttpStatus.ACCEPTED)
  async createDocumentNotes(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateDocumentNotesDto,
  ) {
    return this.service.createDocumentNotes(userId, dto);
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
