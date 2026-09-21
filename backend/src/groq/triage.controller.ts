import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { TriageService } from './triage.service';
import { SendTriageMessageDto } from './dto/send-triage-message.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.PATIENT)
@Controller('triage/sessions')
export class TriageController {
  constructor(private triage: TriageService) {}

  @Post()
  start(@CurrentUser() user: { id: string }, @Body() dto: SendTriageMessageDto) {
    return this.triage.startSession(user.id, dto.message);
  }

  @Get(':id')
  get(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.triage.getSession(user.id, id);
  }

  @Post(':id/messages')
  continue(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: SendTriageMessageDto,
  ) {
    return this.triage.continueSession(user.id, id, dto.message);
  }
}
