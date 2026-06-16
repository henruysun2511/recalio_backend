import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PreviewService } from './preview.service';
import { PreviewRequestDto, PreviewResponseDto } from './preview.dto';
import { Public } from '../../common/decorators/public.decorator';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import { SwaggerDoc } from '../../common/swagger/swagger-doc';

@ApiTags('Preview')
@Controller('preview')
export class PreviewController {
    constructor(private readonly service: PreviewService) { }

    @Post('detect')
    @Public()
    @ResponseMessage('Detect thành công')
    @SwaggerDoc({ summary: 'Detect language and check audio cache', bodyType: PreviewRequestDto, responseType: PreviewResponseDto })
    async detect(@Body() dto: PreviewRequestDto) {
        return this.service.detect(dto);
    }
}
