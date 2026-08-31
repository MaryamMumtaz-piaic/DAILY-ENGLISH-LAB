import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance, AxiosError } from 'axios';
import FormData from 'form-data';

@Injectable()
export class FastApiClient {
  private readonly client: AxiosInstance;
  private readonly logger = new Logger(FastApiClient.name);

  constructor(private readonly configService: ConfigService) {
    const baseURL = this.configService.get<string>('fastapi.url');
    const apiKey = this.configService.get<string>('fastapi.apiKey');

    this.client = axios.create({
      baseURL,
      headers: {
        'X-Internal-API-Key': apiKey || '',
        'Content-Type': 'application/json',
      },
      timeout: 60000,
    });

    // Response interceptor for logging
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        this.logger.error(
          `FastAPI request failed: ${error.config?.method?.toUpperCase()} ${error.config?.url} - ${error.message}`,
        );
        if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
          throw new ServiceUnavailableException('AI service is currently unavailable');
        }
        throw error;
      },
    );
  }

  async transcribeSpeech(
    audioUrl: string,
    language: string,
    userId: string,
    sessionId: string,
  ) {
    const response = await this.client.post('/internal/v1/speech/transcribe', {
      audio_url: audioUrl,
      language,
      user_id: userId,
      session_id: sessionId,
    });
    return response.data;
  }

  async transcribeSpeechDirect(
    audioBuffer: Buffer,
    mimeType: string,
    language: string,
    userId: string,
    sessionId: string,
  ) {
    const form = new FormData();
    form.append('audio', audioBuffer, {
      filename: 'audio.webm',
      contentType: mimeType || 'audio/webm',
    });
    form.append('language', language);
    form.append('user_id', userId);
    form.append('session_id', sessionId);

    const response = await this.client.post(
      '/internal/v1/speech/transcribe-bytes',
      form,
      { headers: form.getHeaders() },
    );
    return response.data;
  }

  async analyzeEnglish(
    text: string,
    context: string,
    userLevel: string,
    knownMistakes: string[],
    sessionId: string,
    userId: string,
  ) {
    const response = await this.client.post('/internal/v1/english/analyze', {
      text,
      context,
      user_level: userLevel,
      known_mistakes: knownMistakes,
      session_id: sessionId,
      user_id: userId,
    });
    return response.data;
  }

  async fixText(text: string, userLevel: string) {
    const response = await this.client.post('/internal/v1/english/fix-text', {
      text,
      user_level: userLevel,
    });
    return response.data;
  }

  async startConversation(
    sessionId: string,
    userId: string,
    userLevel: string,
    knownMistakes: string[],
    topic?: string,
  ) {
    const response = await this.client.post('/internal/v1/conversation/start', {
      session_id: sessionId,
      user_id: userId,
      user_level: userLevel,
      known_mistakes: knownMistakes,
      topic: topic ?? null,
    });
    return response.data;
  }

  async continueConversation(
    sessionId: string,
    userId: string,
    userMessage: string,
    history: Array<{ role: string; content: string }>,
    userLevel: string,
    knownMistakes: string[],
  ) {
    const response = await this.client.post('/internal/v1/conversation/respond', {
      session_id: sessionId,
      user_id: userId,
      user_message: userMessage,
      history,
      user_level: userLevel,
      known_mistakes: knownMistakes,
    });
    return response.data;
  }

  async analyzeProgress(
    userId: string,
    sessionId: string,
    corrections: any[],
    historicalMistakes: string[],
    durationSec: number,
    sessionsCompleted: number,
  ) {
    const response = await this.client.post('/internal/v1/progress/analyze', {
      user_id: userId,
      session_id: sessionId,
      corrections,
      historical_mistakes: historicalMistakes,
      duration_sec: durationSec,
      sessions_completed: sessionsCompleted,
    });
    return response.data;
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.client.get('/health');
      return true;
    } catch {
      return false;
    }
  }
}
