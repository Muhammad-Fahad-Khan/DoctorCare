import { IsIn } from 'class-validator';

export class UpdateAppointmentStatusDto {
  @IsIn(['ACCEPTED', 'REJECTED'])
  status: 'ACCEPTED' | 'REJECTED';
}
