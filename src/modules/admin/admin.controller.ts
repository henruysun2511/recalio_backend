import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { AdminService } from './admin.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import { SwaggerDoc } from '../../common/swagger/swagger-doc';

@ApiTags('Admin')
@ApiBearerAuth()
@Controller('admin')
export class AdminController {
    constructor(private readonly service: AdminService) { }

    @Get('dashboard')
    @Roles(UserRole.ADMIN)
    @ResponseMessage('Lấy dữ liệu dashboard thành công')
    @SwaggerDoc({ summary: 'Admin dashboard stats' })
    async getDashboard() {
        return this.service.getDashboard();
    }
}
