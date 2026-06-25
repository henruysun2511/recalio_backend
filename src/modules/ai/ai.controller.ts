import { Controller, Post, Body, UploadedFile, UseInterceptors, MaxFileSizeValidator, ParseFilePipe, FileTypeValidator } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { AiService } from './ai.service';
import {
    ExtractWordsDto,
    GenerateNotesDto,
    RelatedNotesDto,
    RelatedNotesResponseDto,
    ProcessDocumentDto,
    ProcessDocumentNoteDto,
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

    @Public()
    @Post('related-notes')
    @ResponseMessage('Tạo danh sách từ đồng nghĩa và trái nghĩa')
    @SwaggerDoc({ summary: 'Generate synonyms and antonyms with notes', bodyType: RelatedNotesDto, responseType: RelatedNotesResponseDto })
    async generateRelatedNotes(@Body() dto: RelatedNotesDto) {
        return this.service.generateRelatedNotes(dto);
    }

    @Public()
    @Post('process-document')
    @ApiConsumes('multipart/form-data')
    @ApiBody({ type: ProcessDocumentDto })
    @ResponseMessage('Xử lý tài liệu PDF, trả về các đoạn ý chính')
    @SwaggerDoc({ summary: 'Process PDF document into study notes', responseType: ProcessDocumentNoteDto, isArray: true })
    @UseInterceptors(FileInterceptor('file'))
    async processDocument(
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }),
                    new FileTypeValidator({ fileType: 'application/pdf' }),
                ],
                fileIsRequired: true,
            }),
        )
        file: Express.Multer.File,
    ) {
        return this.service.processDocument(file);
    }

    @Post('detect-image')
    @ApiConsumes('multipart/form-data')
    @ResponseMessage('Nhận diện vật thể trong ảnh')
    @SwaggerDoc({ summary: 'Detect objects in image', responseType: DetectImageResponseDto })
    @UseInterceptors(FileInterceptor('file'))
    async detectImage(
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }),
                    new FileTypeValidator({ fileType: /^image\// }),
                ],
                fileIsRequired: true,
            }),
        )
        file: Express.Multer.File,
    ) {
        return this.service.detectImage(file);
    }
}
