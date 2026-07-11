import { Injectable } from '@nestjs/common';
import { AudioCacheRepository } from '../audio-cache.repository';

@Injectable()
export class AudioCacheService {
  constructor(private readonly repo: AudioCacheRepository) {}

  async findByTextLanguage(text: string, language: string) {
    return this.repo.findByTextLanguage(text, language);
  }

  async mget(keys: { text: string; language: string }[]) {
    return this.repo.mget(keys);
  }

  async save(text: string, language: string, audioUrl: string) {
    return this.repo.save(text, language, audioUrl);
  }

  buildHashKey(text: string, language: string): string {
    return this.repo.buildHashKey(text, language);
  }
}
