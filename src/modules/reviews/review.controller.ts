import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ReviewService } from './review.service';
import {
  CreateReviewDto,
  ReviewResponseDto,
  ReviewQueryDto,
  LatestReviewResponseDto,
} from './review.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import { SwaggerDoc } from '../../common/swagger/swagger-doc';

@ApiTags('Reviews')
@ApiBearerAuth()
@Controller('reviews')
export class ReviewController {
  constructor(private readonly service: ReviewService) {}

  @Post('decks/:deckId')
  @ResponseMessage('Đánh giá deck thành công')
  @SwaggerDoc({
    summary: 'Create or update review',
    bodyType: CreateReviewDto,
    responseType: ReviewResponseDto,
  })
  async upsert(
    @CurrentUser('id') userId: string,
    @Param('deckId') deckId: string,
    @Body() dto: CreateReviewDto,
  ) {
    return this.service.upsert(userId, deckId, dto);
  }

  @Get('decks/:deckId')
  @Public()
  @ResponseMessage('Lấy danh sách đánh giá thành công')
  @SwaggerDoc({
    summary: 'List reviews of a deck',
    responseType: ReviewResponseDto,
    isArray: true,
  })
  async getByDeck(
    @Param('deckId') deckId: string,
    @Query() dto: ReviewQueryDto,
  ) {
    return this.service.getByDeck(deckId, dto);
  }

  @Get('latest')
  @Public()
  @ResponseMessage('Lấy danh sách đánh giá mới nhất thành công')
  @SwaggerDoc({
    summary: 'Get latest 10 reviews',
    responseType: LatestReviewResponseDto,
    isArray: true,
  })
  async getLatest() {
    return this.service.getLatest();
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ResponseMessage('Xoá đánh giá thành công')
  @SwaggerDoc({ summary: 'Delete review (deck owner only)' })
  async delete(@CurrentUser('id') userId: string, @Param('id') id: string) {
    await this.service.delete(userId, id);
  }
}
