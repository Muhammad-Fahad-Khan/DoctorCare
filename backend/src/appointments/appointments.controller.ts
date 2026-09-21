import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { AppointmentsService } from './appointments.service';
import { BookAppointmentDto } from './dto/book-appointment.dto';
import { UpdateAppointmentStatusDto } from './dto/update-appointment-status.dto';
import { CompleteAppointmentDto } from './dto/complete-appointment.dto';
import { SaveNotesDto } from './dto/save-notes.dto';
import { SetGuidanceDto } from './dto/set-guidance.dto';
import { SetMeetingLinkDto } from './dto/set-meeting-link.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('appointments')
export class AppointmentsController {
  constructor(private appointments: AppointmentsService) {}

  @Roles(Role.PATIENT)
  @Post()
  book(@CurrentUser() user: { id: string }, @Body() dto: BookAppointmentDto) {
    return this.appointments.book(user.id, dto);
  }

  // No @Roles here — both patients and doctors can see their own list;
  // the service branches on user.role to decide which foreign key to filter by.
  @Get('me')
  listMine(@CurrentUser() user: { id: string; role: Role }) {
    return this.appointments.listMine(user);
  }

  // Declared after 'me' — Nest matches routes in registration order, and 'me' is a
  // static segment that would otherwise be swallowed by this dynamic :id if reversed.
  @Get(':id')
  getOne(@CurrentUser() user: { id: string; role: Role }, @Param('id') id: string) {
    return this.appointments.getById(user, id);
  }

  @Roles(Role.DOCTOR)
  @Patch(':id/status')
  updateStatus(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: UpdateAppointmentStatusDto,
  ) {
    return this.appointments.updateStatus(user.id, id, dto.status);
  }

  @Roles(Role.DOCTOR)
  @Patch(':id/complete')
  complete(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: CompleteAppointmentDto,
  ) {
    return this.appointments.complete(user.id, id, dto.doctorNotes);
  }

  @Roles(Role.DOCTOR)
  @Patch(':id/notes')
  saveNotes(@CurrentUser() user: { id: string }, @Param('id') id: string, @Body() dto: SaveNotesDto) {
    return this.appointments.saveNotes(user.id, id, dto.doctorNotes);
  }

  @Roles(Role.DOCTOR)
  @Post(':id/urgent-meeting')
  startUrgentMeeting(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.appointments.startUrgentMeeting(user.id, id);
  }

  @Roles(Role.DOCTOR)
  @Delete(':id/urgent-meeting')
  endUrgentMeeting(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.appointments.endUrgentMeeting(user.id, id);
  }

  @Roles(Role.DOCTOR)
  @Patch(':id/guidance')
  setGuidance(@CurrentUser() user: { id: string }, @Param('id') id: string, @Body() dto: SetGuidanceDto) {
    return this.appointments.setGuidance(user.id, id, dto.message, dto.urgent);
  }

  @Roles(Role.DOCTOR)
  @Patch(':id/meeting-link')
  setMeetingLink(@CurrentUser() user: { id: string }, @Param('id') id: string, @Body() dto: SetMeetingLinkDto) {
    return this.appointments.setMeetingLink(user.id, id, dto.meetingUrl);
  }

  @Roles(Role.PATIENT)
  @Patch(':id/cancel')
  cancel(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.appointments.cancel(user.id, id);
  }
}
