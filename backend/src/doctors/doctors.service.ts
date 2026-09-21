import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAvailabilityDto } from './dto/create-availability.dto';
import { matchSpecialty } from '../groq/specialty.util';

@Injectable()
export class DoctorsService {
  constructor(private prisma: PrismaService) {}

  // Public "Doctor Listing" — patients browse doctors, optionally filtered by the
  // specialty the AI triage recommended (SRS 3.2).
  async listApproved(specialty?: string) {
    const doctors = await this.prisma.doctorProfile.findMany({
      where: { status: 'APPROVED' },
      select: {
        id: true,
        specialty: true,
        bio: true,
        yearsExperience: true,
        user: { select: { id: true, fullName: true, avatarUrl: true } },
        // How many bookable slots are left — lets the UI show which doctors can be booked right now.
        _count: { select: { availabilitySlots: { where: { isBooked: false, startTime: { gt: new Date() } } } } },
      },
    });

    // Tolerant match ("orthopedist" / "Cardiology" still find "Orthopedic Surgeon" / "Cardiologist").
    let list = doctors;
    if (specialty?.trim()) {
      const canonical = matchSpecialty(specialty, [...new Set(doctors.map((d) => d.specialty))]);
      list = canonical ? doctors.filter((d) => d.specialty === canonical) : [];
    }

    return list
      .map(({ _count, ...d }) => ({ ...d, openSlots: _count.availabilitySlots }))
      .sort((x, y) => y.openSlots - x.openSlots || x.user.fullName.localeCompare(y.user.fullName));
  }

  // Public — the distinct specialties patients can currently be matched with.
  async listSpecialties() {
    const rows = await this.prisma.doctorProfile.findMany({
      where: { status: 'APPROVED' },
      select: { specialty: true },
      distinct: ['specialty'],
      orderBy: { specialty: 'asc' },
    });
    return rows.map((r) => r.specialty);
  }

  // Public — only future, unbooked slots are bookable.
  async listAvailability(doctorProfileId: string) {
    return this.prisma.availabilitySlot.findMany({
      where: { doctorProfileId, isBooked: false, startTime: { gt: new Date() } },
      orderBy: { startTime: 'asc' },
    });
  }

  private async getOwnProfile(userId: string) {
    const profile = await this.prisma.doctorProfile.findUnique({ where: { userId } });
    if (!profile) {
      throw new NotFoundException('Doctor profile not found for this account.');
    }
    return profile;
  }

  async listMyAvailability(userId: string) {
    const profile = await this.getOwnProfile(userId);
    return this.prisma.availabilitySlot.findMany({
      where: { doctorProfileId: profile.id },
      orderBy: { startTime: 'asc' },
    });
  }

  async createAvailability(userId: string, dto: CreateAvailabilityDto) {
    const profile = await this.getOwnProfile(userId);
    const start = new Date(dto.startTime);
    const end = new Date(dto.endTime);

    if (start >= end) {
      throw new BadRequestException('startTime must be before endTime.');
    }
    if (start < new Date()) {
      throw new BadRequestException('startTime must be in the future.');
    }

    return this.prisma.availabilitySlot.create({
      data: { doctorProfileId: profile.id, startTime: start, endTime: end },
    });
  }

  async deleteAvailability(userId: string, slotId: string) {
    const profile = await this.getOwnProfile(userId);
    const slot = await this.prisma.availabilitySlot.findUnique({ where: { id: slotId } });

    if (!slot || slot.doctorProfileId !== profile.id) {
      throw new NotFoundException('Availability slot not found.');
    }
    if (slot.isBooked) {
      throw new ForbiddenException('Cannot remove a slot that is already booked.');
    }

    await this.prisma.availabilitySlot.delete({ where: { id: slotId } });
    return { deleted: true };
  }
}
