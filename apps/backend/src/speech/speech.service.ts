import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { FastApiClient } from '../fastapi/fastapi.client';

@Injectable()
export class SpeechService {
  private readonly logger = new Logger(SpeechService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
    private readonly fastApiClient: FastApiClient,
  ) {}

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

    // Upload audio to storage
    const key = `speech/${userId}/${sessionId}/${uuidv4()}.webm`;
    const audioUrl = await this.storageService.uploadFile(
      file.buffer,
      key,
      file.mimetype || 'audio/webm',
    );

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
      const result = await this.fastApiClient.transcribeSpeech(
        audioUrl,
        language,
        userId,
        sessionId,
      );

      transcript = result?.transcript ?? null;
      confidence = result?.confidence ?? null;
      audioDurSec = result?.duration_sec ?? null;

      // Update attempt with transcription results
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
