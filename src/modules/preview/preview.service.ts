import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructures/prisma/prisma.service';
import { PreviewRequestDto, PreviewResponseDto } from './preview.dto';
import { detectLanguage } from './language.util';

@Injectable()
export class PreviewService {
    constructor(private readonly prisma: PrismaService) { }

    async detect(dto: PreviewRequestDto): Promise<PreviewResponseDto> {
        const items = await Promise.all(
            dto.items.map(async (item) => {
                const detectedLanguage = item.languageId ?? detectLanguage(item.text);

                const cache = await this.prisma.audioCache.findUnique({
                    where: { text_language: { text: item.text, language: detectedLanguage } },
                    select: { audioUrl: true },
                });

                return {
                    text: item.text,
                    detectedLanguage,
                    audioUrl: cache?.audioUrl ?? null,
                };
            }),
        );

        return { items };
    }
}
