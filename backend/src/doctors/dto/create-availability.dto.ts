import { IsISO8601 } from 'class-validator';

export class CreateAvailabilityDto {
  @IsISO8601()
  startTime: string;

  @IsISO8601()
  endTime: string;
}
