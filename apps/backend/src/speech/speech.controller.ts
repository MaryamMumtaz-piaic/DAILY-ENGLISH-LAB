import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Query,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { SpeechService } from './speech.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';

const MAX_AUDIO_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB

@Controller('api/v1/speech')
@UseGuards(JwtAuthGuard)
export class SpeechController {
  constructor(private readonly speechService: SpeechService) {}

  @Post('transcribe')
  @UseInterceptors(
    FileInterceptor('audio', {
      storage: memoryStorage(),
      limits: { fileSize: MAX_AUDIO_SIZE_BYTES },
    }),
  )
  async transcribe(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: MAX_AUDIO_SIZE_BYTES }),
        ],
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
    @GetUser('id') userId: string,
    @Query('sessionId') sessionId: string,
    @Query('language') language?: string,
  ) {
    if (!sessionId) {
      throw new BadRequestException('sessionId query parameter is required');
    }
    return this.speechService.transcribe(file, userId, sessionId, language || 'en');
  }
}
