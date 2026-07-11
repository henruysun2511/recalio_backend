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
import { UserRole } from '@prisma/client';
import { AchievementService } from './achievement.service';
import {
  CreateAchievementDto,
  UpdateAchievementDto,
  AchievementResponseDto,
  QueryAchievementDto,
} from './achievement.dto';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import { SwaggerDoc } from '../../common/swagger/swagger-doc';

@ApiTags('Achievements')
@ApiBearerAuth()
@Controller('achievements')
export class AchievementController {
  constructor(private readonly service: AchievementService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ResponseMessage('Tạo thành tích thành công')
  @SwaggerDoc({
    summary: 'Create achievement (admin)',
    bodyType: CreateAchievementDto,
    responseType: AchievementResponseDto,
    status: 201,
  })
  async create(@Body() dto: CreateAchievementDto) {
    return this.service.create(dto);
  }

  @Get()
  @Public()
  @ResponseMessage('Lấy danh sách thành tích thành công')
  @SwaggerDoc({
    summary: 'List all achievements',
    responseType: AchievementResponseDto,
    isArray: true,
  })
  async findAll(@Query() dto: QueryAchievementDto) {
    return this.service.findAll(dto);
  }

  @Get(':id')
  @Public()
  @ResponseMessage('Lấy thông tin thành tích thành công')
  @SwaggerDoc({
    summary: 'Get achievement by id',
    responseType: AchievementResponseDto,
  })
  async findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ResponseMessage('Cập nhật thành tích thành công')
  @SwaggerDoc({
    summary: 'Update achievement (admin)',
    bodyType: UpdateAchievementDto,
    responseType: AchievementResponseDto,
  })
  async update(@Param('id') id: string, @Body() dto: UpdateAchievementDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ResponseMessage('Xoá thành tích thành công')
  @SwaggerDoc({ summary: 'Delete achievement (admin)' })
  async delete(@Param('id') id: string) {
    await this.service.delete(id);
  }
}
