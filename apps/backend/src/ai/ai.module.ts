import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { FastApiModule } from '../fastapi/fastapi.module';

@Module({
  imports: [FastApiModule],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}
