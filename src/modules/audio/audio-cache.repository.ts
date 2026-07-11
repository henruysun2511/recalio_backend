import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructures/prisma/prisma.service';

export interface AudioCacheKey {
  text: string;
  language: string;
}

@Injectable()
export class AudioCacheRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByTextLanguage(text: string, language: string) {
    return this.prisma.audioCache.findUnique({
      where: { text_language: { text: text.toLowerCase(), language } },
      select: { audioUrl: true },
    });
  }

  async mget(keys: AudioCacheKey[]) {
    if (!keys.length) return new Map<string, string>();

    const rows = await this.prisma.audioCache.findMany({
      where: {
        OR: keys.map((k) => ({
          text: k.text.toLowerCase(),
          language: k.language,
        })),
      },
      select: { text: true, language: true, audioUrl: true },
    });

    const map = new Map<string, string>();
    for (const row of rows) {
      map.set(this.buildHashKey(row.text, row.language), row.audioUrl);
    }
    return map;
  }

  async save(text: string, language: string, audioUrl: string) {
    return this.prisma.audioCache.upsert({
      where: { text_language: { text: text.toLowerCase(), language } },
      update: { audioUrl },
      create: { text: text.toLowerCase(), language, audioUrl },
    });
  }

  buildHashKey(text: string, language: string): string {
    return `${text.toLowerCase()}::${language}`;
  }
}
