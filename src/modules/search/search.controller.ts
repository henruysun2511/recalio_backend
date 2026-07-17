import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { SearchQueryDto } from './search.dto';
import { Public } from '../../common/decorators/public.decorator';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import { SwaggerDoc } from '../../common/swagger/swagger-doc';

@ApiTags('Search')
@ApiBearerAuth()
@Controller('search')
export class SearchController {
  constructor(private readonly service: SearchService) {}

  @Get()
  @Public()
  @ResponseMessage('Tìm kiếm thành công')
  @SwaggerDoc({ summary: 'Search across decks, posts, and users' })
  async search(@Query() dto: SearchQueryDto) {
    return this.service.search(dto);
  }
}