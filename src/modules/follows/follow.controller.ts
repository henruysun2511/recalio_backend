import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { FollowService } from './follow.service';
import { FollowStatusDto, FollowUserDto } from './follow.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import { SwaggerDoc } from '../../common/swagger/swagger-doc';
import { PaginationDto } from '../../common/dtos/pagination.dto';

@ApiTags('Follow')
@ApiBearerAuth()
@Controller('follow')
export class FollowController {
  constructor(private readonly service: FollowService) {}

  @Post(':id')
  @ResponseMessage('Follow người dùng thành công')
  @SwaggerDoc({
    summary: 'Follow a user',
    responseType: FollowUserDto,
    status: 201,
  })
  async follow(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.service.follow(userId, id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ResponseMessage('Hủy follow người dùng thành công')
  @SwaggerDoc({ summary: 'Unfollow a user' })
  async unfollow(@CurrentUser('id') userId: string, @Param('id') id: string) {
    await this.service.unfollow(userId, id);
  }

  @Get(':id/status')
  @ResponseMessage('Lấy trạng thái follow thành công')
  @SwaggerDoc({ summary: 'Check follow status', responseType: FollowStatusDto })
  async getFollowingStatus(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.service.getFollowingStatus(userId, id);
  }

  @Get(':userId/following')
  @ResponseMessage('Lấy danh sách đang follow thành công')
  @SwaggerDoc({
    summary: 'List who a user is following',
    responseType: FollowUserDto,
    isArray: true,
  })
  async getUserFollowing(
    @Param('userId') userId: string,
    @Query() dto: PaginationDto,
  ) {
    return this.service.getFollowing(userId, dto);
  }

  @Get(':userId/followers')
  @ResponseMessage('Lấy danh sách người theo dõi thành công')
  @SwaggerDoc({
    summary: 'List followers of a user',
    responseType: FollowUserDto,
    isArray: true,
  })
  async getUserFollowers(
    @Param('userId') userId: string,
    @Query() dto: PaginationDto,
  ) {
    return this.service.getFollowers(userId, dto);
  }
}
