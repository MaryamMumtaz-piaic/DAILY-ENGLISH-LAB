import { Injectable } from '@nestjs/common';
import { FastApiClient } from '../fastapi/fastapi.client';

/**
 * AiService acts as a higher-level facade over FastApiClient,
 * providing a clean AI orchestration API to the rest of the application.
 */
@Injectable()
export class AiService {
  constructor(private readonly fastApiClient: FastApiClient) {}

  async analyzeEnglish(
    text: string,
    context: string,
    userLevel: string,
    knownMistakes: string[],
    sessionId: string,
    userId: string,
  ) {
    return this.fastApiClient.analyzeEnglish(
      text,
      context,
      userLevel,
      knownMistakes,
      sessionId,
      userId,
    );
  }

  async fixText(text: string, userLevel: string) {
    return this.fastApiClient.fixText(text, userLevel);
  }

  async startConversation(
    sessionId: string,
    userId: string,
    userLevel: string,
    knownMistakes: string[],
    topic?: string,
  ) {
    return this.fastApiClient.startConversation(
      sessionId,
      userId,
      userLevel,
      knownMistakes,
      topic,
    );
  }

  async continueConversation(
    sessionId: string,
    userId: string,
    userMessage: string,
    history: Array<{ role: string; content: string }>,
    userLevel: string,
    knownMistakes: string[],
  ) {
    return this.fastApiClient.continueConversation(
      sessionId,
      userId,
      userMessage,
      history,
      userLevel,
      knownMistakes,
    );
  }

  async analyzeProgress(
    userId: string,
    sessionId: string,
    corrections: any[],
    historicalMistakes: string[],
    durationSec: number,
    sessionsCompleted: number,
  ) {
    return this.fastApiClient.analyzeProgress(
      userId,
      sessionId,
      corrections,
      historicalMistakes,
      durationSec,
      sessionsCompleted,
    );
  }

  async isHealthy(): Promise<boolean> {
    return this.fastApiClient.healthCheck();
  }
}
