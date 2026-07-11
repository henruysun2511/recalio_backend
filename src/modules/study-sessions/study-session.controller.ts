import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { StudySessionService } from './study-session.service';
import {
  StartSessionDto,
  ListSessionQueryDto,
  SessionResponseDto,
} from './study-session.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import { SwaggerDoc } from '../../common/swagger/swagger-doc';
import { PaginationDto } from '../../common/dtos/pagination.dto';

@ApiTags('Study Sessions')
@ApiBearerAuth()
@Controller('study-sessions')
export class StudySessionController {
  constructor(private readonly service: StudySessionService) {}

  @Post()
  @ResponseMessage('Bắt đầu phiên học')
  @SwaggerDoc({ summary: 'Start a study session', bodyType: StartSessionDto })
  async start(@CurrentUser('id') userId: string, @Body() dto: StartSessionDto) {
    return this.service.start(userId, dto);
  }

  @Patch(':id/end')
  @ResponseMessage('Kết thúc phiên học')
  @SwaggerDoc({ summary: 'End a study session' })
  async end(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.service.end(userId, id);
  }

  @Get()
  @ResponseMessage('Lấy danh sách phiên học')
  @SwaggerDoc({
    summary: 'List study sessions',
    responseType: SessionResponseDto,
    isArray: true,
  })
  async list(
    @CurrentUser('id') userId: string,
    @Query() dto: ListSessionQueryDto,
  ) {
    return this.service.list(userId, dto);
  }

  @Get(':id')
  @ResponseMessage('Lấy chi tiết phiên học')
  @SwaggerDoc({
    summary: 'Get session detail',
    responseType: SessionResponseDto,
  })
  async getById(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.service.getById(userId, id);
  }

  @Get(':id/review-logs')
  @ResponseMessage('Lấy lịch sử review trong phiên')
  @SwaggerDoc({ summary: 'Get review logs of a session' })
  async getReviewLogs(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Query() dto: PaginationDto,
  ) {
    return this.service.getReviewLogs(userId, id, dto);
  }
}
