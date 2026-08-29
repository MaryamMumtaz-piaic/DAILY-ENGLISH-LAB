import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MistakesService } from '../mistakes/mistakes.service';

@Injectable()
export class ProgressService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mistakesService: MistakesService,
  ) {}

  async getUserProgress(userId: string) {
    const [snapshots, sessionsCount, totalMinutesResult, topMistakes] = await Promise.all([
      this.prisma.progressSnapshot.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 30,
      }),
      this.prisma.practiceSession.count({
        where: { userId, status: 'COMPLETED' },
      }),
      this.prisma.progressSnapshot.aggregate({
        where: { userId },
        _sum: { durationMin: true },
      }),
      this.mistakesService.getTopMistakes(userId, 5),
    ]);

    const currentStreak = await this.calculateStreak(userId);
    const totalMinutes = totalMinutesResult._sum.durationMin ?? 0;

    return {
      snapshots,
      totalSessions: sessionsCount,
      totalMinutes,
      currentStreak,
      topMistakes,
    };
  }

  async getUserMistakes(userId: string) {
    return this.mistakesService.getUserMistakes(userId);
  }

  private async calculateStreak(userId: string): Promise<number> {
    const sessions = await this.prisma.practiceSession.findMany({
      where: { userId, status: 'COMPLETED' },
      orderBy: { endedAt: 'desc' },
      select: { endedAt: true },
    });

    if (sessions.length === 0) return 0;

    // Collect unique practice days (YYYY-MM-DD)
    const uniqueDays = new Set<string>();
    for (const s of sessions) {
      if (s.endedAt) {
        uniqueDays.add(s.endedAt.toISOString().split('T')[0]);
      }
    }

    const sortedDays = Array.from(uniqueDays).sort().reverse();
    if (sortedDays.length === 0) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let streak = 0;
    for (let i = 0; i < sortedDays.length; i++) {
      const expected = new Date(today);
      expected.setDate(today.getDate() - i);
      const expectedStr = expected.toISOString().split('T')[0];

      if (sortedDays[i] === expectedStr) {
        streak++;
      } else {
        // Allow one day gap from today (practiced yesterday but not today)
        if (i === 0) {
          const yesterday = new Date(today);
          yesterday.setDate(today.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];
          if (sortedDays[0] === yesterdayStr) {
            // Count from yesterday
            for (let j = 0; j < sortedDays.length; j++) {
              const exp2 = new Date(today);
              exp2.setDate(today.getDate() - 1 - j);
              const exp2Str = exp2.toISOString().split('T')[0];
              if (sortedDays[j] === exp2Str) {
                streak++;
              } else {
                break;
              }
            }
          }
        }
        break;
      }
    }

    return streak;
  }
}
