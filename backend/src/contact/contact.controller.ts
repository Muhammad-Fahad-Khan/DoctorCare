import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { ContactService } from './contact.service';
import { SubmitInquiryDto } from './dto/submit-inquiry.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('contact')
export class ContactController {
  constructor(private contact: ContactService) {}

  @Post()
  submit(@Body() dto: SubmitInquiryDto) {
    return this.contact.submit(dto);
  }
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('admin/contact-inquiries')
export class AdminContactController {
  constructor(private contact: ContactService) {}

  @Get()
  list() {
    return this.contact.list();
  }

  @Patch(':id/handled')
  markHandled(@Param('id') id: string) {
    return this.contact.markHandled(id);
  }
}
