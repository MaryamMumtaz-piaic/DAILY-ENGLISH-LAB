import { Controller, Get, UseGuards } from '@nestjs/common';
import { ProgressService } from './progress.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';

@Controller('api/v1')
@UseGuards(JwtAuthGuard)
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Get('progress')
  getProgress(@GetUser('id') userId: string) {
    return this.progressService.getUserProgress(userId);
  }

  @Get('mistakes')
  getMistakes(@GetUser('id') userId: string) {
    return this.progressService.getUserMistakes(userId);
  }
}
