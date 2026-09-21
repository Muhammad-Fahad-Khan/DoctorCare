import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GroqService, TriageTurn } from './groq.service';

interface StoredMessage {
  role: 'user' | 'assistant';
  content: string;
  ts: string;
}

@Injectable()
export class TriageService {
  constructor(private prisma: PrismaService, private groq: GroqService) {}

  async startSession(patientId: string, firstMessage: string) {
    const messages: StoredMessage[] = [{ role: 'user', content: firstMessage, ts: new Date().toISOString() }];
    const turn = await this.groq.runTriageTurn(
      messages.map(({ role, content }) => ({ role, content })),
      await this.availableSpecialties(),
    );
    messages.push({ role: 'assistant', content: turn.reply, ts: new Date().toISOString() });

    return this.prisma.triageSession.create({
      data: {
        patientId,
        messages: messages as any,
        ...this.turnToColumns(turn),
      },
    });
  }

  async continueSession(patientId: string, sessionId: string, message: string) {
    const session = await this.getOwned(patientId, sessionId);
    const messages = (session.messages as unknown as StoredMessage[]) ?? [];

    messages.push({ role: 'user', content: message, ts: new Date().toISOString() });
    const turn = await this.groq.runTriageTurn(
      messages.map(({ role, content }) => ({ role, content })),
      await this.availableSpecialties(),
    );
    messages.push({ role: 'assistant', content: turn.reply, ts: new Date().toISOString() });

    return this.prisma.triageSession.update({
      where: { id: sessionId },
      data: { messages: messages as any, ...this.turnToColumns(turn) },
    });
  }

  async getSession(patientId: string, sessionId: string) {
    return this.getOwned(patientId, sessionId);
  }

  /** Specialties of doctors a patient could actually be matched with right now. */
  private async availableSpecialties(): Promise<string[]> {
    const rows = await this.prisma.doctorProfile.findMany({
      where: { status: 'APPROVED' },
      select: { specialty: true },
      distinct: ['specialty'],
    });
    const seen = new Map<string, string>();
    for (const { specialty } of rows) {
      const clean = specialty.trim();
      if (clean && !seen.has(clean.toLowerCase())) seen.set(clean.toLowerCase(), clean);
    }
    return [...seen.values()].sort();
  }

  private async getOwned(patientId: string, sessionId: string) {
    const session = await this.prisma.triageSession.findUnique({ where: { id: sessionId } });
    if (!session) {
      throw new NotFoundException('Triage session not found.');
    }
    if (session.patientId !== patientId) {
      throw new ForbiddenException('You do not have access to this triage session.');
    }
    return session;
  }

  private turnToColumns(turn: TriageTurn) {
    return {
      detectedSymptoms: turn.detectedSymptoms as any,
      urgencyTag: turn.urgencyTag,
      recommendedSpecialty: turn.recommendedSpecialty,
      summary: turn.summary,
    };
  }
}
