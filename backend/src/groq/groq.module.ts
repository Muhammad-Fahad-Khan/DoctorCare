import { Module } from '@nestjs/common';
import { GroqService } from './groq.service';
import { TriageService } from './triage.service';
import { GroqSettingsController } from './groq-settings.controller';
import { TriageController } from './triage.controller';

@Module({
  controllers: [GroqSettingsController, TriageController],
  providers: [GroqService, TriageService],
  exports: [GroqService],
})
export class GroqModule {}
