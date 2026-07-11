import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { ReportService } from './report.service';
import {
  CreateReportDto,
  ReportDeckDto,
  ReportAdminDto,
} from './report.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { SwaggerDoc } from '../../common/swagger/swagger-doc';
import { PaginationDto } from '../../common/dtos/pagination.dto';

@ApiTags('Reports')
@ApiBearerAuth()
@Controller('reports')
export class ReportController {
  constructor(private readonly service: ReportService) {}

  @Post('decks/:deckId')
  @ResponseMessage('Báo cáo deck thành công')
  @SwaggerDoc({
    summary: 'Report a deck',
    bodyType: CreateReportDto,
    responseType: ReportDeckDto,
    status: 201,
  })
  async create(
    @CurrentUser('id') userId: string,
    @Param('deckId') deckId: string,
    @Body() dto: CreateReportDto,
  ) {
    return this.service.create(userId, deckId, dto);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @ResponseMessage('Lấy danh sách báo cáo thành công')
  @SwaggerDoc({
    summary: 'List reports (admin only)',
    responseType: ReportAdminDto,
    isArray: true,
  })
  async findAll(@Query() dto: PaginationDto) {
    return this.service.findAll(dto);
  }
}
