export abstract class AiProvider {
    abstract generateText(prompt: string): Promise<string>;
    abstract analyzeImage(imageBuffer: Buffer, mimeType: string, prompt: string): Promise<string>;
    abstract isConfigured(): boolean;
}
