import { Module } from '@nestjs/common';
import { CorrectionsService } from './corrections.service';

@Module({
  providers: [CorrectionsService],
  exports: [CorrectionsService],
})
export class CorrectionsModule {}
