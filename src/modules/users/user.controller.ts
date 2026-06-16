import { Controller, Get, Patch, Body } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UserService } from './user.service';
import { UpdateUserDto } from './user.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import { SwaggerDoc } from '../../common/swagger/swagger-doc';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UserController {
    constructor(private readonly service: UserService) { }

    @Get('me')
    @ResponseMessage('Lấy thông tin người dùng thành công')
    @SwaggerDoc({ summary: 'Get current user profile' })
    async getProfile(@CurrentUser('id') userId: string) {
        return this.service.getProfile(userId);
    }

    @Patch('me')
    @ResponseMessage('Cập nhật thông tin thành công')
    @SwaggerDoc({ summary: 'Update current user profile', bodyType: UpdateUserDto })
    async updateProfile(@CurrentUser('id') userId: string, @Body() dto: UpdateUserDto) {
        return this.service.updateProfile(userId, dto);
    }
}
