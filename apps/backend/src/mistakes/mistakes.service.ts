import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface MistakeRecord {
  category: string;
  severity?: string;
}

@Injectable()
export class MistakesService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserMistakes(userId: string) {
    return this.prisma.userMistake.findMany({
      where: { userId },
      orderBy: { frequency: 'desc' },
    });
  }

  async recordMistakes(userId: string, mistakes: MistakeRecord[]): Promise<void> {
    if (!mistakes?.length) return;

    const operations = mistakes.map((mistake) =>
      this.prisma.userMistake.upsert({
        where: {
          userId_category: {
            userId,
            category: mistake.category,
          },
        },
        update: {
          frequency: { increment: 1 },
          lastSeen: new Date(),
          severity: mistake.severity ?? 'medium',
        },
        create: {
          userId,
          category: mistake.category,
          frequency: 1,
          severity: mistake.severity ?? 'medium',
        },
      }),
    );

    await Promise.all(operations);
  }

  async getMistakeContext(userId: string): Promise<string[]> {
    const mistakes = await this.prisma.userMistake.findMany({
      where: { userId },
      orderBy: { frequency: 'desc' },
      take: 10,
    });

    return mistakes.map(
      (m) => `${m.category} (frequency: ${m.frequency}, severity: ${m.severity})`,
    );
  }

  async updateImprovement(
    userId: string,
    category: string,
    improvement: number,
  ): Promise<void> {
    await this.prisma.userMistake.updateMany({
      where: { userId, category },
      data: { improvement },
    });
  }

  async getTopMistakes(userId: string, take = 5) {
    return this.prisma.userMistake.findMany({
      where: { userId },
      orderBy: { frequency: 'desc' },
      take,
    });
  }
}
