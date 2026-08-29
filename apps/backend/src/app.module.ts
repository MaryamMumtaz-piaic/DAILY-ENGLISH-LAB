import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import configuration from './config/configuration';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PracticeModule } from './practice/practice.module';
import { SessionsModule } from './sessions/sessions.module';
import { CorrectionsModule } from './corrections/corrections.module';
import { MistakesModule } from './mistakes/mistakes.module';
import { ProgressModule } from './progress/progress.module';
import { SpeechModule } from './speech/speech.module';
import { AiModule } from './ai/ai.module';
import { FastApiModule } from './fastapi/fastapi.module';
import { StorageModule } from './storage/storage.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: ['.env', '.env.local'],
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => [
        {
          name: 'default',
          ttl: configService.get<number>('throttle.ttl') * 1000,
          limit: configService.get<number>('throttle.limit'),
        },
      ],
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    PracticeModule,
    SessionsModule,
    CorrectionsModule,
    MistakesModule,
    ProgressModule,
    SpeechModule,
    AiModule,
    FastApiModule,
    StorageModule,
    HealthModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
