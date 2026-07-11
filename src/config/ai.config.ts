import { AppConfig } from './app.config';

interface AiModels {
  gemini: string;
  openai: string;
  [key: string]: string;
}

export const aiConfig = {
  provider: AppConfig.AI_PROVIDER ?? 'gemini',
  apiKeys: {
    gemini: AppConfig.GEMINI_API_KEY,
    openai: AppConfig.OPENAI_API_KEY,
  },
  models: {
    gemini: 'gemini-2.5-flash',
    openai: 'gpt-4o-mini',
  },

  get apiKey() {
    return this.apiKeys[this.provider] ?? '';
  },

  get model() {
    return this.models[this.provider] ?? this.models.gemini;
  },
};
