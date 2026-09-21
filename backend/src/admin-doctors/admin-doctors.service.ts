import { Injectable, NotFoundException } from '@nestjs/common';
import { DoctorStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminDoctorsService {
  constructor(private prisma: PrismaService) {}

  // status filter lets the Admin dashboard's "Pending" tab (SRS: "Appointment Queue" /
  // "User & License Management") query just the accounts that need review.
  async list(status?: DoctorStatus) {
    return this.prisma.doctorProfile.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'asc' },
      include: {
        user: { select: { id: true, email: true, fullName: true, createdAt: true } },
      },
    });
  }

  async updateStatus(doctorProfileId: string, status: DoctorStatus) {
    const profile = await this.prisma.doctorProfile.findUnique({ where: { id: doctorProfileId } });
    if (!profile) {
      throw new NotFoundException('Doctor profile not found.');
    }

    return this.prisma.doctorProfile.update({
      where: { id: doctorProfileId },
      data: { status },
      include: { user: { select: { id: true, email: true, fullName: true } } },
    });
  }
}
