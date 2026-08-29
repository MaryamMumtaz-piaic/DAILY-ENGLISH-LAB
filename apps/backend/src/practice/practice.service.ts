import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SessionsService } from '../sessions/sessions.service';
import { CorrectionsService } from '../corrections/corrections.service';
import { MistakesService } from '../mistakes/mistakes.service';
import { FastApiClient } from '../fastapi/fastapi.client';
import { CreateSessionDto } from './dto/create-session.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { AnalyzeTextDto } from './dto/analyze-text.dto';

@Injectable()
export class PracticeService {
  private readonly logger = new Logger(PracticeService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly sessionsService: SessionsService,
    private readonly correctionsService: CorrectionsService,
    private readonly mistakesService: MistakesService,
    private readonly fastApiClient: FastApiClient,
  ) {}

  async createSession(userId: string, dto: CreateSessionDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new InternalServerErrorException('User context not found');

    const knownMistakes = await this.mistakesService.getMistakeContext(userId);

    // Create the session record
    const session = await this.sessionsService.create(userId, dto.type, dto.topic);

    // Start conversation with AI service
    let openingMessage: string | null = null;
    try {
      const aiResponse = await this.fastApiClient.startConversation(
        session.id,
        userId,
        user.level,
        knownMistakes,
        dto.topic,
      );
      openingMessage = aiResponse?.message ?? null;

      if (openingMessage) {
        await this.sessionsService.addMessage(session.id, 'ASSISTANT', openingMessage);
      }
    } catch (error) {
      this.logger.warn(
        `Failed to start AI conversation for session ${session.id}: ${error.message}`,
      );
    }

    return { session, openingMessage };
  }

  async getSession(userId: string, sessionId: string) {
    return this.sessionsService.findByIdWithOwnerCheck(sessionId, userId);
  }

  async getUserSessions(userId: string) {
    return this.sessionsService.findAllByUser(userId);
  }

  async sendMessage(userId: string, sessionId: string, dto: SendMessageDto) {
    const session = await this.sessionsService.findByIdWithOwnerCheck(sessionId, userId);
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new InternalServerErrorException('User context not found');

    const knownMistakes = await this.mistakesService.getMistakeContext(userId);

    // Persist user message
    await this.sessionsService.addMessage(sessionId, 'USER', dto.content);

    // Build conversation history for context
    const history = session.messages.map((m) => ({
      role: m.role.toLowerCase(),
      content: m.content,
    }));

    // Get AI reply
    let assistantMessage = '';
    try {
      const aiResponse = await this.fastApiClient.continueConversation(
        sessionId,
        userId,
        dto.content,
        history,
        user.level,
        knownMistakes,
      );
      assistantMessage = aiResponse?.message ?? '';
    } catch (error) {
      this.logger.warn(`AI conversation error: ${error.message}`);
      assistantMessage = "I'm having trouble responding right now. Please try again.";
    }

    // Persist assistant message
    await this.sessionsService.addMessage(sessionId, 'ASSISTANT', assistantMessage);

    // Analyze the user's English (non-blocking on error)
    let correction = null;
    if (dto.content.trim()) {
      try {
        const analysisResult = await this.fastApiClient.analyzeEnglish(
          dto.content,
          `Conversation topic: ${session.topic ?? 'General English conversation'}`,
          user.level,
          knownMistakes,
          sessionId,
          userId,
        );

        if (analysisResult) {
          correction = await this.correctionsService.createCorrection({
            sessionId,
            originalText: dto.content,
            correctedText: analysisResult.corrected_text ?? dto.content,
            isCorrect: analysisResult.is_correct ?? true,
            overallScore: analysisResult.overall_score,
            shouldRetry: analysisResult.should_retry ?? false,
            encouragement: analysisResult.encouragement,
            naturalAlternative: analysisResult.natural_alternative,
            difficulty: analysisResult.difficulty,
            mistakes: analysisResult.mistakes ?? [],
          });

          // Track mistakes in user profile
          if (analysisResult.mistakes?.length) {
            await this.mistakesService.recordMistakes(userId, analysisResult.mistakes);
          }
        }
      } catch (error) {
        this.logger.warn(`English analysis error: ${error.message}`);
      }
    }

    return { assistantMessage, correction };
  }

  async endSession(userId: string, sessionId: string) {
    const session = await this.sessionsService.findByIdWithOwnerCheck(sessionId, userId);

    const durationSec = session.startedAt
      ? Math.floor((Date.now() - session.startedAt.getTime()) / 1000)
      : 0;

    await this.sessionsService.complete(sessionId, durationSec);

    // Gather data for progress analysis
    const corrections = await this.correctionsService.getSessionCorrections(sessionId);
    const historicalMistakes = await this.mistakesService.getMistakeContext(userId);
    const sessionsCount = await this.prisma.practiceSession.count({
      where: { userId, status: 'COMPLETED' },
    });

    // Analyze progress with AI service
    let progress = null;
    try {
      const progressData = await this.fastApiClient.analyzeProgress(
        userId,
        sessionId,
        corrections,
        historicalMistakes,
        durationSec,
        sessionsCount,
      );

      if (progressData) {
        progress = progressData;
        // Persist progress snapshot
        await this.prisma.progressSnapshot.create({
          data: {
            userId,
            sessionId,
            durationMin: Math.ceil(durationSec / 60),
            sentencesPracticed: progressData.sentences_practiced ?? corrections.length,
            areasPracticed: progressData.areas_practiced ?? [],
            recurringMistakes: progressData.recurring_mistakes ?? [],
            improvementSignals: progressData.improvement_signals ?? [],
            recommendedFocus: progressData.recommended_focus,
          },
        });
      }
    } catch (error) {
      this.logger.warn(`Progress analysis error: ${error.message}`);
    }

    return { message: 'Session completed successfully', durationSec, progress };
  }

  async analyzeText(userId: string, dto: AnalyzeTextDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new InternalServerErrorException('User context not found');

    return this.fastApiClient.fixText(dto.text, user.level);
  }
}
