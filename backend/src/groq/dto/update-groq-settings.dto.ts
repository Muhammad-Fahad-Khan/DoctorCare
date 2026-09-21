import { IsNumber, IsOptional, IsString, Max, Min, MinLength } from 'class-validator';

export class UpdateGroqSettingsDto {
  // Optional: omit to keep the currently stored key unchanged (e.g. when only
  // tweaking temperature). Sending an empty string clears it.
  @IsOptional()
  @IsString()
  @MinLength(10)
  apiKey?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(2)
  temperature?: number;
}
