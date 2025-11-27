// src/utils/stt-manager.ts

import { SpeechClient, protos } from '@google-cloud/speech';
import { logger } from './logger';
import * as fs from 'fs';
import * as path from 'path';

type IRecognitionConfig = protos.google.cloud.speech.v1.IRecognitionConfig;

export class STTManager {
  private client!: SpeechClient;

  constructor() {
    this.initializeClient();
  }

  private initializeClient(): void {
    try {
      const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

      if (credentialsPath) {
        const absolutePath = path.resolve(credentialsPath);
        if (!fs.existsSync(absolutePath)) {
          throw new Error(`Credentials not found: ${absolutePath}`);
        }

        const credentials = JSON.parse(fs.readFileSync(absolutePath, 'utf8'));
        this.client = new SpeechClient({
          credentials: {
            client_email: credentials.client_email,
            private_key: credentials.private_key,
          },
          projectId: credentials.project_id,
        });
      } else {
        this.client = new SpeechClient();
      }

      logger.info('[STTManager] Initialized successfully');
    } catch (error) {
      logger.error('[STTManager] Initialization failed', error);
      throw error;
    }
  }

  async transcribe(
    audioBuffer: Buffer,
    languageCode: string = 'en-US'
  ): Promise<string> {
    try {
      const config: IRecognitionConfig = {
        encoding: 'WEBM_OPUS', // or LINEAR16, FLAC, etc.
        sampleRateHertz: 48000,
        languageCode,
        model: 'latest_long',
        enableAutomaticPunctuation: true,
        enableWordTimeOffsets: false,
      };

      const [response] = await this.client.recognize({
        config,
        audio: { content: audioBuffer.toString('base64') },
      });

      const transcription = response.results
        ?.map(result => result.alternatives?.[0]?.transcript)
        .filter(Boolean)
        .join(' ');

      logger.debug('[STTManager] Transcription complete', {
        length: transcription?.length,
      });

      return transcription || '';
    } catch (error) {
      logger.error('[STTManager] Transcription failed', error);
      throw error;
    }
  }

  async transcribeStream(
    audioStream: NodeJS.ReadableStream,
    languageCode: string = 'en-US'
  ): Promise<AsyncGenerator<string>> {
    const config: IRecognitionConfig = {
      encoding: 'WEBM_OPUS',
      sampleRateHertz: 48000,
      languageCode,
      enableAutomaticPunctuation: true,
    };

    const recognizeStream = this.client.streamingRecognize({
      config,
      interimResults: true,
    });

    audioStream.pipe(recognizeStream);

    return this.streamResults(recognizeStream);
  }

  private async *streamResults(
    stream: NodeJS.ReadableStream
  ): AsyncGenerator<string> {
    for await (const data of stream) {
      const result = (data as any).results?.[0];
      if (result?.alternatives?.[0]) {
        yield result.alternatives[0].transcript;
      }
    }
  }
}