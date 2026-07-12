import {
  Controller,
  Get,
  Patch,
  Delete,
  Body,
  Query,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UserService } from './user.service';
import { UpdateUserDto, UserQueryDto, UpdateUserRoleDto } from './user.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import { SwaggerDoc } from '../../common/swagger/swagger-doc';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UserController {
  constructor(private readonly service: UserService) {}

  @Get('me')
  @ResponseMessage('Lấy thông tin người dùng thành công')
  @SwaggerDoc({ summary: 'Get current user profile' })
  async getProfile(@CurrentUser('id') userId: string) {
    return this.service.getProfile(userId);
  }

  @Patch('me')
  @ResponseMessage('Cập nhật thông tin thành công')
  @SwaggerDoc({
    summary: 'Update current user profile',
    bodyType: UpdateUserDto,
  })
  async updateProfile(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.service.updateProfile(userId, dto);
  }

  @Delete('me')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ResponseMessage('Xóa tài khoản thành công')
  @SwaggerDoc({ summary: 'Delete current user account (soft delete)' })
  async deleteAccount(@CurrentUser('id') userId: string) {
    await this.service.deleteAccount(userId);
  }

  @Get('me/languages')
  @ResponseMessage('Lấy danh sách ngôn ngữ thành công')
  @SwaggerDoc({ summary: 'Get current user languages' })
  async getLanguages(@CurrentUser('id') userId: string) {
    return this.service.getLanguages(userId);
  }

  @Get(':username')
  @Public()
  @ResponseMessage('Lấy thông tin người dùng thành công')
  @SwaggerDoc({ summary: 'Get public user profile by username' })
  async getPublicProfile(@Param('username') username: string) {
    return this.service.getPublicProfile(username);
  }

  @Get()
  @Roles('ADMIN')
  @ResponseMessage('Lấy danh sách người dùng thành công')
  @SwaggerDoc({ summary: 'List users (admin)' })
  async findAll(@Query() dto: UserQueryDto) {
    return this.service.findAll(dto);
  }

  @Patch(':id/toggle-active')
  @Roles('ADMIN')
  @ResponseMessage('Cập nhật trạng thái người dùng thành công')
  @SwaggerDoc({ summary: 'Toggle user active status (admin)' })
  async toggleActive(@Param('id') id: string) {
    return this.service.toggleActive(id);
  }

  @Patch(':id/role')
  @Roles('ADMIN')
  @ResponseMessage('Cập nhật vai trò người dùng thành công')
  @SwaggerDoc({
    summary: 'Update user role (admin)',
    bodyType: UpdateUserRoleDto,
  })
  async updateRole(@Param('id') id: string, @Body() dto: UpdateUserRoleDto) {
    return this.service.updateRole(id, dto);
  }
}
