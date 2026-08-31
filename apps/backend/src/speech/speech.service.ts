import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { FastApiClient } from '../fastapi/fastapi.client';

@Injectable()
export class SpeechService {
  private readonly logger = new Logger(SpeechService.name);
  private readonly storageConfigured: boolean;

  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
    private readonly fastApiClient: FastApiClient,
    private readonly configService: ConfigService,
  ) {
    this.storageConfigured = !!this.configService.get<string>('storage.accessKey');
  }

  async transcribe(
    file: Express.Multer.File,
    userId: string,
    sessionId: string,
    language = 'en',
  ) {
    if (!file) {
      throw new BadRequestException('Audio file is required');
    }

    // Verify session exists and belongs to user
    const session = await this.prisma.practiceSession.findFirst({
      where: { id: sessionId, userId },
    });
    if (!session) {
      throw new BadRequestException('Session not found or access denied');
    }

    let audioUrl: string;

    if (this.storageConfigured) {
      const key = `speech/${userId}/${sessionId}/${uuidv4()}.webm`;
      audioUrl = await this.storageService.uploadFile(
        file.buffer,
        key,
        file.mimetype || 'audio/webm',
      );
    } else {
      // No storage configured (local dev): use a placeholder URL.
      // Audio bytes are sent directly to the AI service below.
      audioUrl = `local://${userId}/${sessionId}/${uuidv4()}.webm`;
      this.logger.warn('Storage not configured — audio will not be persisted');
    }

    // Create speech attempt record
    const attempt = await this.prisma.speechAttempt.create({
      data: {
        sessionId,
        userId,
        audioUrl,
        mimeType: file.mimetype || 'audio/webm',
      },
    });

    // Transcribe via FastAPI
    let transcript: string | null = null;
    let confidence: number | null = null;
    let audioDurSec: number | null = null;

    try {
      let result: Record<string, unknown>;

      if (this.storageConfigured) {
        result = await this.fastApiClient.transcribeSpeech(
          audioUrl,
          language,
          userId,
          sessionId,
        );
      } else {
        result = await this.fastApiClient.transcribeSpeechDirect(
          file.buffer,
          file.mimetype || 'audio/webm',
          language,
          userId,
          sessionId,
        );
      }

      transcript = (result?.transcript as string) ?? null;
      confidence = (result?.confidence as number) ?? null;
      audioDurSec = (result?.duration_sec as number) ?? null;

      await this.prisma.speechAttempt.update({
        where: { id: attempt.id },
        data: { transcript, confidence, audioDurSec },
      });
    } catch (error) {
      this.logger.error(`Transcription failed for attempt ${attempt.id}: ${error.message}`);
    }

    return {
      attemptId: attempt.id,
      transcript,
      confidence,
      audioDurSec,
      audioUrl,
    };
  }
}
