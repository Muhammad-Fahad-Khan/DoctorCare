import { IsOptional, IsString } from 'class-validator';

export class BookAppointmentDto {
  @IsString()
  slotId: string;

  // Links the booking to the AI triage conversation that recommended this doctor,
  // so the doctor's "Patient AI Brief" (SRS 2.2) has something to show.
  @IsOptional()
  @IsString()
  triageSessionId?: string;
}
