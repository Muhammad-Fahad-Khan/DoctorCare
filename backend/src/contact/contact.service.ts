import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubmitInquiryDto } from './dto/submit-inquiry.dto';

@Injectable()
export class ContactService {
  constructor(private prisma: PrismaService) {}

  submit(dto: SubmitInquiryDto) {
    return this.prisma.contactInquiry.create({ data: dto });
  }

  // newest first, unhandled surfaced before handled — this is the "admin notification inbox" from SRS 2.1.
  list() {
    return this.prisma.contactInquiry.findMany({ orderBy: [{ handled: 'asc' }, { createdAt: 'desc' }] });
  }

  async markHandled(id: string) {
    const inquiry = await this.prisma.contactInquiry.findUnique({ where: { id } });
    if (!inquiry) {
      throw new NotFoundException('Inquiry not found.');
    }
    return this.prisma.contactInquiry.update({ where: { id }, data: { handled: true } });
  }
}
