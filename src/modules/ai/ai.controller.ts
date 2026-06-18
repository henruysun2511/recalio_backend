import { Controller, Post, Body, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { AiService } from './ai.service';
import {
    ExtractWordsDto,
    GenerateNotesDto,
    AiNoteDto,
    DetectImageResponseDto,
} from './ai.dto';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import { SwaggerDoc } from '../../common/swagger/swagger-doc';
import { Public } from 'src/common/decorators/public.decorator';

@ApiTags('AI Features')
@ApiBearerAuth()
@Controller('ai')
export class AiController {
    constructor(private readonly service: AiService) { }

    @Public()
    @Post('extract-from-text')
    @ResponseMessage('Trích xuất từ vựng từ đoạn văn')
    @SwaggerDoc({ summary: 'Extract notes from text', bodyType: ExtractWordsDto, responseType: AiNoteDto, isArray: true })
    async extractWords(@Body() dto: ExtractWordsDto) {
        return this.service.extractWords(dto);
    }

    @Public()
    @Post('extract-from-topic')
    @ResponseMessage('Tạo danh sách note từ chủ đề')
    @SwaggerDoc({ summary: 'Generate notes from topic', bodyType: GenerateNotesDto, responseType: AiNoteDto, isArray: true })
    async generateNotes(@Body() dto: GenerateNotesDto) {
        return this.service.generateNotes(dto);
    }

    @Post('detect-image')
    @ApiConsumes('multipart/form-data')
    @ResponseMessage('Nhận diện vật thể trong ảnh')
    @SwaggerDoc({ summary: 'Detect objects in image', responseType: DetectImageResponseDto })
    @UseInterceptors(FileInterceptor('file'))
    async detectImage(@UploadedFile() file: Express.Multer.File) {
        return this.service.detectImage(file);
    }
}
