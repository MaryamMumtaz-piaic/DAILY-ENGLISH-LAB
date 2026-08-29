import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PracticeService } from './practice.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { AnalyzeTextDto } from './dto/analyze-text.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';

@Controller('api/v1/practice')
@UseGuards(JwtAuthGuard)
export class PracticeController {
  constructor(private readonly practiceService: PracticeService) {}

  @Post('sessions')
  createSession(
    @GetUser('id') userId: string,
    @Body() dto: CreateSessionDto,
  ) {
    return this.practiceService.createSession(userId, dto);
  }

  @Get('sessions')
  getUserSessions(@GetUser('id') userId: string) {
    return this.practiceService.getUserSessions(userId);
  }

  @Get('sessions/:sessionId')
  getSession(
    @GetUser('id') userId: string,
    @Param('sessionId') sessionId: string,
  ) {
    return this.practiceService.getSession(userId, sessionId);
  }

  @Post('sessions/:sessionId/messages')
  sendMessage(
    @GetUser('id') userId: string,
    @Param('sessionId') sessionId: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.practiceService.sendMessage(userId, sessionId, dto);
  }

  @Post('sessions/:sessionId/end')
  @HttpCode(HttpStatus.OK)
  endSession(
    @GetUser('id') userId: string,
    @Param('sessionId') sessionId: string,
  ) {
    return this.practiceService.endSession(userId, sessionId);
  }

  @Post('analyze')
  @HttpCode(HttpStatus.OK)
  analyzeText(
    @GetUser('id') userId: string,
    @Body() dto: AnalyzeTextDto,
  ) {
    return this.practiceService.analyzeText(userId, dto);
  }
}
