import { Controller, Get, Patch, Body, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { DeckSettingService } from './deck-setting.service';
import { UpdateDeckSettingDto, DeckSettingResponseDto } from './deck-setting.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import { SwaggerDoc } from '../../common/swagger/swagger-doc';

@ApiTags('Deck Settings')
@ApiBearerAuth()
@Controller('decks')
export class DeckSettingController {
    constructor(private readonly service: DeckSettingService) { }

    @Get(':deckId/setting')
    @ResponseMessage('Lấy cài đặt deck thành công')
    @SwaggerDoc({ summary: 'Get deck setting', responseType: DeckSettingResponseDto })
    async get(@CurrentUser('id') userId: string, @Param('deckId') deckId: string) {
        return this.service.get(userId, deckId);
    }

    @Patch(':deckId/setting')
    @ResponseMessage('Cập nhật cài đặt deck thành công')
    @SwaggerDoc({ summary: 'Update deck setting', bodyType: UpdateDeckSettingDto, responseType: DeckSettingResponseDto })
    async update(@CurrentUser('id') userId: string, @Param('deckId') deckId: string, @Body() dto: UpdateDeckSettingDto) {
        return this.service.update(userId, deckId, dto);
    }
}
