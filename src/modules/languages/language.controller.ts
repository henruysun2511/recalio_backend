import { Controller, Get, Post, Patch, Delete, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { LanguageService } from './language.service';
import { CreateLanguageDto, UpdateLanguageDto, LanguageResponseDto } from './language.dto';
import { Public } from '../../common/decorators/public.decorator';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { SwaggerDoc } from '../../common/swagger/swagger-doc';

@ApiTags('Languages')
@Controller('languages')
export class LanguageController {
    constructor(private readonly service: LanguageService) { }

    @Get('supported')
    @Public()
    @ResponseMessage('Lấy danh sách ngôn ngữ được hỗ trợ thành công')
    @SwaggerDoc({ summary: 'List supported languages', responseType: LanguageResponseDto, isArray: true })
    async getSupported() {
        return this.service.findAllSupported();
    }

    @Get()
    @ApiBearerAuth()
    @Roles(UserRole.ADMIN)
    @ResponseMessage('Lấy danh sách ngôn ngữ thành công')
    @SwaggerDoc({ summary: 'List all languages (admin)', responseType: LanguageResponseDto, isArray: true })
    async findAll() {
        return this.service.findAll();
    }

    @Post()
    @ApiBearerAuth()
    @Roles(UserRole.ADMIN)
    @ResponseMessage('Thêm ngôn ngữ thành công')
    @SwaggerDoc({ summary: 'Create language (admin)', bodyType: CreateLanguageDto, responseType: LanguageResponseDto, status: 201 })
    async create(@Body() dto: CreateLanguageDto) {
        return this.service.create(dto);
    }

    @Patch(':id')
    @ApiBearerAuth()
    @Roles(UserRole.ADMIN)
    @ResponseMessage('Cập nhật ngôn ngữ thành công')
    @SwaggerDoc({ summary: 'Update language (admin)', bodyType: UpdateLanguageDto, responseType: LanguageResponseDto })
    async update(@Param('id') id: string, @Body() dto: UpdateLanguageDto) {
        return this.service.update(id, dto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiBearerAuth()
    @Roles(UserRole.ADMIN)
    @ResponseMessage('Xoá ngôn ngữ thành công')
    @SwaggerDoc({ summary: 'Delete language (admin)' })
    async delete(@Param('id') id: string) {
        await this.service.delete(id);
    }
}
