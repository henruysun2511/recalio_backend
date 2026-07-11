import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
import { aiConfig } from '../../../config/ai.config';
import { AiProvider } from './ai-provider.interface';

@Injectable()
export class GeminiProvider extends AiProvider {
  private readonly genAI: GoogleGenAI;
  private readonly model = aiConfig.models.gemini;

  constructor() {
    super();
    this.genAI = new GoogleGenAI({ apiKey: aiConfig.apiKeys.gemini });
  }

  isConfigured(): boolean {
    return !!aiConfig.apiKeys.gemini;
  }

  async generateText(prompt: string): Promise<string> {
    const response = await this.genAI.models.generateContent({
      model: this.model,
      contents: [{ text: prompt }],
      config: { temperature: 0.1 },
    });
    return response.text ?? '';
  }

  async analyzeImage(
    imageBuffer: Buffer,
    mimeType: string,
    prompt: string,
  ): Promise<string> {
    const response = await this.genAI.models.generateContent({
      model: this.model,
      contents: [
        { text: prompt },
        { inlineData: { mimeType, data: imageBuffer.toString('base64') } },
      ],
      config: { temperature: 0 },
    });
    return response.text ?? '';
  }
}
