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
  Res,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { ApiTags, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { DeckService } from './deck.service';
import {
  CreateDeckDto,
  UpdateDeckDto,
  QueryDeckDto,
  DeckResponseDto,
  ExportDeckDto,
} from './deck.dto';
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
  @SwaggerDoc({
    summary: 'List public decks',
    responseType: DeckResponseDto,
    isArray: true,
  })
  async getPublicList(@Query() dto: QueryDeckDto) {
    return this.service.getPublicList(dto);
  }

  @Get('me')
  @ResponseMessage('Lấy danh sách deck của tôi thành công')
  @SwaggerDoc({
    summary: 'List my decks',
    responseType: DeckResponseDto,
    isArray: true,
  })
  async getMyList(
    @CurrentUser('id') userId: string,
    @Query() dto: QueryDeckDto,
  ) {
    return this.service.getMyList(userId, dto);
  }

  @Get('archived')
  @ResponseMessage('Lấy danh sách deck đã lưu trữ thành công')
  @SwaggerDoc({
    summary: 'List archived decks',
    responseType: DeckResponseDto,
    isArray: true,
  })
  async getArchivedList(
    @CurrentUser('id') userId: string,
    @Query() dto: QueryDeckDto,
  ) {
    return this.service.getArchivedList(userId, dto);
  }

  @Get('featured')
  @Public()
  @ResponseMessage('Lấy danh sách deck nổi bật thành công')
  @SwaggerDoc({ summary: 'List featured decks', responseType: DeckResponseDto, isArray: true })
  async getFeaturedList(@Query() dto: QueryDeckDto) {
    return this.service.getFeaturedList(dto);
  }

  @Get('cloned')
  @ResponseMessage('Lấy danh sách deck đã clone thành công')
  @SwaggerDoc({
    summary: 'List cloned decks',
    responseType: DeckResponseDto,
    isArray: true,
  })
  async getClonedList(
    @CurrentUser('id') userId: string,
    @Query() dto: QueryDeckDto,
  ) {
    return this.service.getClonedList(userId, dto);
  }

  @Get(':id')
  @ResponseMessage('Lấy thông tin deck thành công')
  @SwaggerDoc({ summary: 'Get deck by id', responseType: DeckResponseDto })
  async getById(
    @CurrentUser('id') userId: string | undefined,
    @Param('id') id: string,
  ) {
    return this.service.getById(id, userId);
  }

  @Post()
  @ResponseMessage('Tạo deck thành công')
  @SwaggerDoc({
    summary: 'Create deck',
    bodyType: CreateDeckDto,
    responseType: DeckResponseDto,
    status: 201,
  })
  async create(@CurrentUser('id') userId: string, @Body() dto: CreateDeckDto) {
    return this.service.create(userId, dto);
  }

  @Patch(':id')
  @ResponseMessage('Cập nhật deck thành công')
  @SwaggerDoc({
    summary: 'Update deck (owner only)',
    bodyType: UpdateDeckDto,
    responseType: DeckResponseDto,
  })
  async update(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateDeckDto,
  ) {
    return this.service.update(userId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ResponseMessage('Xoá deck thành công')
  @SwaggerDoc({ summary: 'Delete deck (owner only)' })
  async delete(@CurrentUser('id') userId: string, @Param('id') id: string) {
    await this.service.delete(userId, id);
  }

  @Post(':id/clone')
  @ResponseMessage('Clone deck thành công')
  @SwaggerDoc({
    summary: 'Clone deck',
    responseType: DeckResponseDto,
    status: 201,
  })
  async clone(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.service.clone(userId, id);
  }

  @Patch(':id/archive')
  @ResponseMessage('Cập nhật trạng thái lưu trữ deck thành công')
  @SwaggerDoc({
    summary: 'Toggle archive (owner only)',
    responseType: DeckResponseDto,
  })
  async toggleArchive(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.service.toggleArchive(userId, id);
  }

  @Patch(':id/ban')
  @Roles(UserRole.ADMIN)
  @ResponseMessage('Cập nhật trạng thái cấm deck thành công')
  @SwaggerDoc({
    summary: 'Toggle ban deck (admin only)',
    responseType: DeckResponseDto,
  })
  async toggleBan(@Param('id') id: string) {
    return this.service.toggleBan(id);
  }

  @Patch(':id/feature')
  @Roles(UserRole.ADMIN)
  @ResponseMessage('Cập nhật trạng thái nổi bật của deck thành công')
  @SwaggerDoc({
    summary: 'Toggle featured deck (admin only)',
    responseType: DeckResponseDto,
  })
  async toggleFeatured(@Param('id') id: string) {
    return this.service.toggleFeatured(id);
  }

  @Get('admin/public')
  @Roles(UserRole.ADMIN)
  @ResponseMessage('Lấy danh sách deck công khai cho admin')
  @SwaggerDoc({
    summary: 'List public decks (admin)',
    responseType: DeckResponseDto,
    isArray: true,
  })
  async listPublic(@Query() dto: QueryDeckDto) {
    return this.service.getPublicList(dto);
  }

  @Get(':id/export')
  @ResponseMessage('Tải xuống deck thành công')
  @SwaggerDoc({ summary: 'Export deck as .rcl file' })
  async exportDeck(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Query() dto: ExportDeckDto,
    @Res() res: Response,
  ) {
    await this.service.exportDeck(id, userId, dto.includeMedia ?? false, res);
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ResponseMessage('Import deck thành công')
  @SwaggerDoc({ summary: 'Import deck from .rcl file' })
  async importDeck(
    @CurrentUser('id') userId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('Vui lòng chọn file .rcl');
    return this.service.importDeck(userId, file);
  }
}
