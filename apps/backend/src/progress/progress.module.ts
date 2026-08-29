import { Module } from '@nestjs/common';
import { ProgressService } from './progress.service';
import { ProgressController } from './progress.controller';
import { MistakesModule } from '../mistakes/mistakes.module';

@Module({
  imports: [MistakesModule],
  controllers: [ProgressController],
  providers: [ProgressService],
})
export class ProgressModule {}
