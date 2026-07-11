import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { NoteTemplateService } from './note-template.service';
import {
  CreateNoteTemplateDto,
  UpdateNoteTemplateDto,
  NoteTemplateResponseDto,
  CreateCardTemplateDto,
  UpdateCardTemplateDto,
  CardTemplateResponseDto,
} from './note-template.dto';
import { Public } from '../../common/decorators/public.decorator';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { SwaggerDoc } from '../../common/swagger/swagger-doc';

@ApiTags('Note Templates')
@Controller('note-templates')
export class NoteTemplateController {
  constructor(private readonly service: NoteTemplateService) {}

  // ─── Note Template ─────────────────────────────────────

  @Get()
  @Public()
  @ResponseMessage('Lấy danh sách note template thành công')
  @SwaggerDoc({
    summary: 'List all note templates',
    responseType: NoteTemplateResponseDto,
    isArray: true,
  })
  async findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @Public()
  @ResponseMessage('Lấy note template thành công')
  @SwaggerDoc({
    summary: 'Get note template by id',
    responseType: NoteTemplateResponseDto,
  })
  async findById(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Post()
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @ResponseMessage('Tạo note template thành công')
  @SwaggerDoc({
    summary: 'Create note template (admin)',
    bodyType: CreateNoteTemplateDto,
    responseType: NoteTemplateResponseDto,
    status: 201,
  })
  async create(@Body() dto: CreateNoteTemplateDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @ResponseMessage('Cập nhật note template thành công')
  @SwaggerDoc({
    summary: 'Update note template (admin)',
    bodyType: UpdateNoteTemplateDto,
    responseType: NoteTemplateResponseDto,
  })
  async update(@Param('id') id: string, @Body() dto: UpdateNoteTemplateDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @ResponseMessage('Xoá note template thành công')
  @SwaggerDoc({ summary: 'Delete note template (admin)' })
  async delete(@Param('id') id: string) {
    await this.service.delete(id);
  }

  // ─── Card Template ─────────────────────────────────────

  @Get(':noteTemplateId/card-templates')
  @Public()
  @ResponseMessage('Lấy danh sách card template thành công')
  @SwaggerDoc({
    summary: 'List card templates of a note template',
    responseType: CardTemplateResponseDto,
    isArray: true,
  })
  async getCardTemplates(@Param('noteTemplateId') noteTemplateId: string) {
    return this.service.getCardTemplates(noteTemplateId);
  }

  @Post(':noteTemplateId/card-templates')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @ResponseMessage('Tạo card template thành công')
  @SwaggerDoc({
    summary: 'Create card template (admin)',
    bodyType: CreateCardTemplateDto,
    responseType: CardTemplateResponseDto,
    status: 201,
  })
  async createCardTemplate(
    @Param('noteTemplateId') noteTemplateId: string,
    @Body() dto: CreateCardTemplateDto,
  ) {
    return this.service.createCardTemplate(noteTemplateId, dto);
  }

  @Patch(':noteTemplateId/card-templates/:id')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @ResponseMessage('Cập nhật card template thành công')
  @SwaggerDoc({
    summary: 'Update card template (admin)',
    bodyType: UpdateCardTemplateDto,
    responseType: CardTemplateResponseDto,
  })
  async updateCardTemplate(
    @Param('noteTemplateId') noteTemplateId: string,
    @Param('id') id: string,
    @Body() dto: UpdateCardTemplateDto,
  ) {
    return this.service.updateCardTemplate(noteTemplateId, id, dto);
  }

  @Delete(':noteTemplateId/card-templates/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @ResponseMessage('Xoá card template thành công')
  @SwaggerDoc({ summary: 'Delete card template (admin)' })
  async deleteCardTemplate(
    @Param('noteTemplateId') noteTemplateId: string,
    @Param('id') id: string,
  ) {
    await this.service.deleteCardTemplate(noteTemplateId, id);
  }
}
