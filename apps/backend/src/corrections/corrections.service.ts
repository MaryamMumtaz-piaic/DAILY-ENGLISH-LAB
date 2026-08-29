import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface MistakeData {
  type: string;
  category: string;
  original: string;
  corrected: string;
  explanation: string;
  severity?: string;
}

export interface CreateCorrectionData {
  sessionId: string;
  speechAttemptId?: string;
  originalText: string;
  correctedText: string;
  isCorrect: boolean;
  overallScore?: number;
  shouldRetry?: boolean;
  encouragement?: string;
  naturalAlternative?: string;
  difficulty?: string;
  mistakes?: MistakeData[];
}

@Injectable()
export class CorrectionsService {
  constructor(private readonly prisma: PrismaService) {}

  async createCorrection(data: CreateCorrectionData) {
    return this.prisma.correction.create({
      data: {
        sessionId: data.sessionId,
        speechAttemptId: data.speechAttemptId ?? undefined,
        originalText: data.originalText,
        correctedText: data.correctedText,
        isCorrect: data.isCorrect,
        overallScore: data.overallScore ?? undefined,
        shouldRetry: data.shouldRetry ?? false,
        encouragement: data.encouragement ?? undefined,
        naturalAlternative: data.naturalAlternative ?? undefined,
        difficulty: data.difficulty ?? undefined,
        mistakes: data.mistakes?.length
          ? {
              create: data.mistakes.map((m) => ({
                type: m.type,
                category: m.category,
                original: m.original,
                corrected: m.corrected,
                explanation: m.explanation,
                severity: m.severity ?? 'medium',
              })),
            }
          : undefined,
      },
      include: { mistakes: true },
    });
  }

  async getSessionCorrections(sessionId: string) {
    return this.prisma.correction.findMany({
      where: { sessionId },
      include: { mistakes: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getSessionCorrectionCount(sessionId: string): Promise<number> {
    return this.prisma.correction.count({ where: { sessionId } });
  }

  async getCorrectionById(id: string) {
    return this.prisma.correction.findUnique({
      where: { id },
      include: { mistakes: true },
    });
  }
}
