import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { DoctorsService } from './doctors.service';
import { CreateAvailabilityDto } from './dto/create-availability.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('doctors')
export class DoctorsController {
  constructor(private doctors: DoctorsService) {}

  @Get()
  list(@Query('specialty') specialty?: string) {
    return this.doctors.listApproved(specialty);
  }

  @Get('specialties')
  specialties() {
    return this.doctors.listSpecialties();
  }

  // Must be declared before ':doctorProfileId/availability' — otherwise Nest/Express
  // would match "me" as a doctorProfileId param for this route's path shape.
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DOCTOR)
  @Get('me/availability')
  listMine(@CurrentUser() user: { id: string }) {
    return this.doctors.listMyAvailability(user.id);
  }

  @Get(':doctorProfileId/availability')
  listAvailability(@Param('doctorProfileId') id: string) {
    return this.doctors.listAvailability(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DOCTOR)
  @Post('me/availability')
  create(@CurrentUser() user: { id: string }, @Body() dto: CreateAvailabilityDto) {
    return this.doctors.createAvailability(user.id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DOCTOR)
  @Delete('me/availability/:slotId')
  remove(@CurrentUser() user: { id: string }, @Param('slotId') slotId: string) {
    return this.doctors.deleteAvailability(user.id, slotId);
  }
}
