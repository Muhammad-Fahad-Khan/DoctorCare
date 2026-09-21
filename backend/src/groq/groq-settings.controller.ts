import { Body, Controller, Get, Post, Put, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { GroqService } from './groq.service';
import { UpdateGroqSettingsDto } from './dto/update-groq-settings.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('admin/settings/groq')
export class GroqSettingsController {
  constructor(private groq: GroqService) {}

  // Never returns the decrypted key — only whether one is set, plus model/temperature.
  @Get()
  get() {
    return this.groq.getPublicSettings();
  }

  @Put()
  update(@Body() dto: UpdateGroqSettingsDto) {
    return this.groq.updateSettings(dto);
  }

  @Post('test-connection')
  test() {
    return this.groq.testConnection();
  }

  @Get('models')
  listModels() {
    return this.groq.listModels();
  }
}
