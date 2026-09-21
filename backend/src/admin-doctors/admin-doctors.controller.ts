import {
  Body,
  Controller,
  Get,
  Param,
  ParseEnumPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { DoctorStatus, Role } from '@prisma/client';
import { AdminDoctorsService } from './admin-doctors.service';
import { UpdateDoctorStatusDto } from './dto/update-doctor-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('admin/doctors')
export class AdminDoctorsController {
  constructor(private service: AdminDoctorsService) {}

  @Get()
  list(@Query('status', new ParseEnumPipe(DoctorStatus, { optional: true })) status?: DoctorStatus) {
    return this.service.list(status);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateDoctorStatusDto) {
    return this.service.updateStatus(id, dto.status);
  }
}
