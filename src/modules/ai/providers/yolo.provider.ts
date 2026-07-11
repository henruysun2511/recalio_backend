import { Injectable, Logger } from '@nestjs/common';
import { spawn } from 'child_process';
import { join } from 'path';
import { AiProvider } from './ai-provider.interface';

@Injectable()
export class YoloProvider extends AiProvider {
  private readonly logger = new Logger(YoloProvider.name);
  private readonly scriptPath = join(
    __dirname,
    '../../../../scripts/yolo_detect.py',
  );

  isConfigured(): boolean {
    return true;
  }

  async generateText(_prompt: string): Promise<string> {
    throw new Error('YOLO provider only supports image detection');
  }

  async analyzeImage(
    imageBuffer: Buffer,
    _mimeType: string,
    _prompt: string,
  ): Promise<string> {
    const input = JSON.stringify({ image: imageBuffer.toString('base64') });

    return new Promise((resolve, reject) => {
      const proc = spawn('python', [this.scriptPath], {
        stdio: ['pipe', 'pipe', 'pipe'],
        timeout: 30000,
      });

      let stdout = '';
      let stderr = '';

      proc.stdout.on('data', (data: Buffer) => {
        stdout += data.toString();
      });
      proc.stderr.on('data', (data: Buffer) => {
        stderr += data.toString();
      });

      proc.on('close', (code) => {
        if (code !== 0) {
          this.logger.error(`YOLO process exited ${code}: ${stderr}`);
          if (
            stderr.includes('No module named') ||
            stderr.includes('not found')
          ) {
            reject(
              new Error(
                'YOLOv10 not installed. Run: pip install ultralytics pillow',
              ),
            );
          } else {
            reject(new Error(`YOLO detection failed (exit ${code})`));
          }
          return;
        }

        try {
          const result = JSON.parse(stdout.trim());
          if (result.error) {
            reject(new Error(result.error));
            return;
          }
          resolve(JSON.stringify(result));
        } catch {
          reject(new Error(`Invalid YOLO output: ${stdout.slice(0, 200)}`));
        }
      });

      proc.on('error', (err) => {
        reject(
          new Error(
            `Python not found. Install Python 3 + pip install ultralytics pillow`,
          ),
        );
      });

      proc.stdin.write(input);
      proc.stdin.end();
    });
  }
}
