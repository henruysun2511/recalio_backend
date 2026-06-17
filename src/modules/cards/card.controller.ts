import { Controller, Get, Post, Patch, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CardService } from './card.service';
import { DueCardsQueryDto, ReviewCardDto, FlagCardDto, CardResponseDto, CardStatsDto } from './card.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import { SwaggerDoc } from '../../common/swagger/swagger-doc';

@ApiTags('Cards')
@ApiBearerAuth()
@Controller('cards')
export class CardController {
    constructor(private readonly service: CardService) { }

    @Get('due')
    @ResponseMessage('Lấy danh sách card đến hạn')
    @SwaggerDoc({ summary: 'Get due cards', responseType: CardResponseDto, isArray: true })
    async getDueCards(@CurrentUser('id') userId: string, @Query() dto: DueCardsQueryDto) {
        return this.service.getDueCards(userId, dto);
    }

    @Get('stats')
    @ResponseMessage('Lấy thống kê card')
    @SwaggerDoc({ summary: 'Get card stats', responseType: CardStatsDto })
    async getStats(@CurrentUser('id') userId: string, @Query('deckId') deckId?: string) {
        return this.service.getStats(userId, deckId);
    }

    @Get(':id')
    @ResponseMessage('Lấy chi tiết card')
    @SwaggerDoc({ summary: 'Get card detail', responseType: CardResponseDto })
    async getCard(@CurrentUser('id') userId: string, @Param('id') id: string) {
        return this.service.getCard(userId, id);
    }

    @Post(':id/review')
    @ResponseMessage('Ghi nhận kết quả ôn tập')
    @SwaggerDoc({ summary: 'Review a card' })
    async review(@CurrentUser('id') userId: string, @Param('id') id: string, @Body() dto: ReviewCardDto) {
        return this.service.review(userId, id, dto);
    }

    @Patch(':id/flag')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ResponseMessage('Cập nhật cờ')
    @SwaggerDoc({ summary: 'Flag a card' })
    async flag(@CurrentUser('id') userId: string, @Param('id') id: string, @Body() dto: FlagCardDto) {
        await this.service.flagCard(userId, id, dto.flags);
    }

    @Patch(':id/suspend')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ResponseMessage('Chuyển trạng thái suspend')
    @SwaggerDoc({ summary: 'Toggle suspend' })
    async toggleSuspend(@CurrentUser('id') userId: string, @Param('id') id: string) {
        await this.service.toggleSuspend(userId, id);
    }

    @Patch(':id/bury')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ResponseMessage('Bury card đến hết ngày')
    @SwaggerDoc({ summary: 'Bury a card' })
    async bury(@CurrentUser('id') userId: string, @Param('id') id: string) {
        await this.service.buryCard(userId, id);
    }
}
