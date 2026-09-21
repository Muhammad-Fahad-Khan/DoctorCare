import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class SetGuidanceDto {
  // Empty string clears the guidance.
  @IsString()
  @MaxLength(2000)
  message: string;

  // Highlights the message for the patient as time-sensitive.
  @IsOptional()
  @IsBoolean()
  urgent?: boolean;
}
