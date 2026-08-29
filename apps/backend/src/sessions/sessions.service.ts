import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SessionType, SessionStatus, Role } from '@prisma/client';

@Injectable()
export class SessionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, type: SessionType, topic?: string) {
    return this.prisma.practiceSession.create({
      data: { userId, type, topic },
    });
  }

  async findById(sessionId: string) {
    return this.prisma.practiceSession.findUnique({
      where: { id: sessionId },
      include: {
        messages: { orderBy: { createdAt: 'asc' } },
      },
    });
  }

  async findByIdWithOwnerCheck(sessionId: string, userId: string) {
    const session = await this.prisma.practiceSession.findUnique({
      where: { id: sessionId },
      include: {
        messages: { orderBy: { createdAt: 'asc' } },
      },
    });
    if (!session) throw new NotFoundException('Session not found');
    if (session.userId !== userId) throw new ForbiddenException('Access denied');
    return session;
  }

  async findAllByUser(userId: string) {
    return this.prisma.practiceSession.findMany({
      where: { userId },
      orderBy: { startedAt: 'desc' },
      include: {
        _count: { select: { messages: true, corrections: true } },
      },
    });
  }

  async addMessage(sessionId: string, role: Role, content: string) {
    return this.prisma.practiceMessage.create({
      data: { sessionId, role, content },
    });
  }

  async complete(sessionId: string, durationSec?: number) {
    return this.prisma.practiceSession.update({
      where: { id: sessionId },
      data: {
        status: SessionStatus.COMPLETED,
        endedAt: new Date(),
        durationSec,
      },
    });
  }

  async abandon(sessionId: string) {
    return this.prisma.practiceSession.update({
      where: { id: sessionId },
      data: {
        status: SessionStatus.ABANDONED,
        endedAt: new Date(),
      },
    });
  }
}
