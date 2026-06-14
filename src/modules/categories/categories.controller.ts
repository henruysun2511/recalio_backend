import { Controller, Get, Post, Patch, Delete, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto, QueryCategoryDto, CategoryResponseDto } from './categories.dto';
import { RoleType } from '../../common/enums/role-type.enum';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import { SwaggerDoc } from '../../common/swagger/swagger-doc';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Categories')
@ApiBearerAuth()
@Controller({ path: 'categories', version: '1' })
export class CategoriesController {
  constructor(private readonly service: CategoriesService) {}

  @Post()
  @Roles(RoleType.ADMIN)
  @ResponseMessage('Tạo danh mục thành công')
  @SwaggerDoc({ summary: 'Create category (admin only)', bodyType: CreateCategoryDto, responseType: CategoryResponseDto, status: 201 })
  async create(@Body() dto: CreateCategoryDto) {
    return this.service.create(dto);
  }

  @Get()
  @Public()
  @SwaggerDoc({ summary: 'List categories (paginated)', responseType: CategoryResponseDto, isArray: true })
  async findAll(@Query() query: QueryCategoryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @Public()
  @SwaggerDoc({ summary: 'Get category detail', responseType: CategoryResponseDto })
  async findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @Roles(RoleType.ADMIN)
  @ResponseMessage('Cập nhật danh mục thành công')
  @SwaggerDoc({ summary: 'Update category (admin only)', bodyType: UpdateCategoryDto, responseType: CategoryResponseDto })
  async update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles(RoleType.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ResponseMessage('Xóa danh mục thành công')
  @SwaggerDoc({ summary: 'Delete category (admin only)' })
  async remove(@Param('id') id: string) {
    await this.service.remove(id);
  }
}
