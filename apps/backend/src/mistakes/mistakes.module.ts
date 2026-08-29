import { Module } from '@nestjs/common';
import { MistakesService } from './mistakes.service';

@Module({
  providers: [MistakesService],
  exports: [MistakesService],
})
export class MistakesModule {}
