import { Module } from '@nestjs/common';
import { AudioCacheService } from './services/audio-cache.service';
import { AudioCacheRepository } from './audio-cache.repository';
import { DictionaryService } from './services/dictionary.service';
import { TtsService } from './services/tts.service';

@Module({
  providers: [
    AudioCacheService,
    AudioCacheRepository,
    DictionaryService,
    TtsService,
  ],
  exports: [AudioCacheService, DictionaryService, TtsService],
})
export class AudioModule {}
