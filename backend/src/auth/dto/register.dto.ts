import { IsEmail, IsEnum, IsString, MinLength, ValidateIf } from 'class-validator';
import { Role } from '@prisma/client';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  fullName: string;

  @IsEnum(Role)
  role: Role; // PATIENT | DOCTOR — ADMIN accounts are seeded/promoted directly, never self-registered

  // Required only when role === DOCTOR. A doctor registering this way lands in
  // DoctorProfile.status = PENDING and cannot log in with doctor privileges
  // until an Admin approves them (see AuthService.register).
  @ValidateIf((o) => o.role === Role.DOCTOR)
  @IsString()
  specialty?: string;

  @ValidateIf((o) => o.role === Role.DOCTOR)
  @IsString()
  licenseNumber?: string;
}
