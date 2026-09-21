import { IsString, MinLength } from 'class-validator';

export class SendTriageMessageDto {
  @IsString()
  @MinLength(1)
  message: string;
}
