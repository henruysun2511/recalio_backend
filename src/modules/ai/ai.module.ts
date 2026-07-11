import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { GeminiProvider } from './providers/gemini.provider';
import { YoloProvider } from './providers/yolo.provider';
import { AiProvider } from './providers/ai-provider.interface';
import { AI_PROVIDER_TOKEN } from './ai.constant';
import { aiConfig } from '../../config/ai.config';

const providerMap: Record<string, new (...args: any[]) => AiProvider> = {
  gemini: GeminiProvider,
  yolo: YoloProvider,
};

const ProviderClass = providerMap[aiConfig.provider] ?? GeminiProvider;

const providerFactory = {
  provide: AI_PROVIDER_TOKEN,
  useClass: ProviderClass,
};

@Module({
  controllers: [AiController],
  providers: [AiService, providerFactory],
  exports: [AiService],
})
export class AiModule {}
