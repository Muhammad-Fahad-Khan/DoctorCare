import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtPayload } from './jwt-payload.interface';

const SALT_ROUNDS = 12;

function sanitize<T extends { passwordHash: string }>(user: T) {
  const { passwordHash, ...rest } = user;
  return rest;
}

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}

  async register(dto: RegisterDto) {
    if (dto.role === Role.ADMIN) {
      // Admin accounts are provisioned directly (seed/another admin), never via public signup.
      throw new ForbiddenException('Admin accounts cannot be self-registered.');
    }

    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('An account with this email already exists.');
    }

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        fullName: dto.fullName,
        role: dto.role,
      },
    });

    if (dto.role === Role.DOCTOR) {
      await this.prisma.doctorProfile.create({
        data: {
          userId: user.id,
          specialty: dto.specialty!,
          licenseNumber: dto.licenseNumber!,
          // status defaults to PENDING — no token issued below until an Admin approves
        },
      });

      return {
        message: 'Registration received. An admin will review your credentials before you can log in.',
        user: sanitize(user),
      };
    }

    return { accessToken: this.signToken(user.id, user.email, user.role), user: sanitize(user) };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { doctorProfile: true },
    });

    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    if (user.role === Role.DOCTOR && user.doctorProfile?.status !== 'APPROVED') {
      throw new ForbiddenException('Your account is pending admin approval.');
    }

    return {
      accessToken: this.signToken(user.id, user.email, user.role),
      user: sanitize(user),
    };
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Account not found.');
    }
    if (!(await bcrypt.compare(dto.currentPassword, user.passwordHash))) {
      throw new UnauthorizedException('Current password is incorrect.');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: await bcrypt.hash(dto.newPassword, SALT_ROUNDS) },
    });
    return { changed: true };
  }

  private signToken(sub: string, email: string, role: Role) {
    const payload: JwtPayload = { sub, email, role };
    return this.jwt.sign(payload);
  }
}
