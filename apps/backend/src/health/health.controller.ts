import { Controller, Get, Injectable } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  HealthIndicator,
  HealthIndicatorResult,
  HealthCheckError,
} from '@nestjs/terminus';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { FastApiClient } from '../fastapi/fastapi.client';

@Injectable()
class DatabaseHealthIndicator extends HealthIndicator {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return this.getStatus(key, true);
    } catch (error) {
      throw new HealthCheckError(
        'Database health check failed',
        this.getStatus(key, false, { message: error.message }),
      );
    }
  }
}

@Injectable()
class AiServiceHealthIndicator extends HealthIndicator {
  constructor(private readonly fastApiClient: FastApiClient) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    const isUp = await this.fastApiClient.healthCheck();
    if (!isUp) {
      throw new HealthCheckError(
        'AI service health check failed',
        this.getStatus(key, false),
      );
    }
    return this.getStatus(key, true);
  }
}

@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly dbIndicator: DatabaseHealthIndicator,
    private readonly aiIndicator: AiServiceHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.dbIndicator.isHealthy('database'),
      () => this.aiIndicator.isHealthy('ai-service'),
    ]);
  }

  @Get('ready')
  @HealthCheck()
  ready() {
    return this.health.check([() => this.dbIndicator.isHealthy('database')]);
  }

  @Get('live')
  live() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}

export { DatabaseHealthIndicator, AiServiceHealthIndicator };
