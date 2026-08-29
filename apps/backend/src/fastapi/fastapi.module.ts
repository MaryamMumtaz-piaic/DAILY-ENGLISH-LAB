import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FastApiClient } from './fastapi.client';

@Module({
  imports: [ConfigModule],
  providers: [FastApiClient],
  exports: [FastApiClient],
})
export class FastApiModule {}
