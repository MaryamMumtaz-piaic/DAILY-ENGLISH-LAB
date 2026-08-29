import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import {
  HealthController,
  DatabaseHealthIndicator,
  AiServiceHealthIndicator,
} from './health.controller';
import { FastApiModule } from '../fastapi/fastapi.module';

@Module({
  imports: [TerminusModule, FastApiModule],
  controllers: [HealthController],
  providers: [DatabaseHealthIndicator, AiServiceHealthIndicator],
})
export class HealthModule {}
