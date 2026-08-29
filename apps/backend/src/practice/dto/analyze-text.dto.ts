import { IsString, MinLength, MaxLength, IsOptional } from 'class-validator';

export class AnalyzeTextDto {
  @IsString()
  @MinLength(1, { message: 'Text cannot be empty' })
  @MaxLength(5000)
  text: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  context?: string;
}
