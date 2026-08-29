import { Module } from '@nestjs/common';
import { SpeechService } from './speech.service';
import { SpeechController } from './speech.controller';
import { StorageModule } from '../storage/storage.module';
import { FastApiModule } from '../fastapi/fastapi.module';

@Module({
  imports: [StorageModule, FastApiModule],
  controllers: [SpeechController],
  providers: [SpeechService],
})
export class SpeechModule {}
