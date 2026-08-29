import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { SessionType } from '@prisma/client';

export class CreateSessionDto {
  @IsEnum(SessionType, {
    message: `type must be one of: ${Object.values(SessionType).join(', ')}`,
  })
  type: SessionType;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  topic?: string;
}
