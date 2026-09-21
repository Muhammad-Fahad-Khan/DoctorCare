import { IsEnum } from 'class-validator';
import { DoctorStatus } from '@prisma/client';

export class UpdateDoctorStatusDto {
  @IsEnum(DoctorStatus)
  status: DoctorStatus; // APPROVED | REJECTED | SUSPENDED (PENDING is the only status never set manually)
}
