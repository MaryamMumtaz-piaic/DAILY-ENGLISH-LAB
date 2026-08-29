import { Module } from '@nestjs/common';
import { PracticeService } from './practice.service';
import { PracticeController } from './practice.controller';
import { SessionsModule } from '../sessions/sessions.module';
import { CorrectionsModule } from '../corrections/corrections.module';
import { MistakesModule } from '../mistakes/mistakes.module';
import { FastApiModule } from '../fastapi/fastapi.module';

@Module({
  imports: [SessionsModule, CorrectionsModule, MistakesModule, FastApiModule],
  controllers: [PracticeController],
  providers: [PracticeService],
})
export class PracticeModule {}
