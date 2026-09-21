import { Injectable, OnModuleInit, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Groq from 'groq-sdk';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateGroqSettingsDto } from './dto/update-groq-settings.dto';
import { encryptSecret, decryptSecret } from './crypto.util';
import { resolveSpecialty } from './specialty.util';

const SETTINGS_ID = 'singleton';

export interface TriageTurn {
  reply: string;
  detectedSymptoms: string[];
  urgencyTag: 'Routine' | 'Soon' | 'Urgent';
  recommendedSpecialty: string | null;
  summary: string | null;
}

// After this many patient messages the assistant must stop asking and commit to a recommendation.
const MAX_QUESTION_ROUNDS = 4;

function buildSystemPrompt(availableSpecialties: string[], patientTurns: number): string {
  const specialtyRules = availableSpecialties.length
    ? `The doctors currently registered on DocuCare have these specialties (exact spelling):
${JSON.stringify(availableSpecialties)}
recommendedSpecialty MUST be exactly one of those strings, or null while you are still gathering information.
Pick the closest fit for the patient's problem. If the problem belongs to a specialty that is NOT in the list
(for example dental problems), choose the closest available one - usually "General Physician" if it is listed -
and say plainly in "reply" that no specialist of that exact type is available right now. Never invent a specialty.`
    : `No doctors are registered on the platform yet, so always leave recommendedSpecialty and summary null and
tell the patient that no doctors are available right now.`;

  const commitRule =
    patientTurns >= MAX_QUESTION_ROUNDS
      ? 'You have asked enough questions. In THIS reply you MUST set recommendedSpecialty and summary - do not ask another question.'
      : `Ask at most ${MAX_QUESTION_ROUNDS - 1} short follow-up questions in total, one at a time. If the situation is clearly urgent or clear enough already, commit sooner.`;

  return `You are DocuCare's triage assistant. You are not a doctor and must never diagnose.
Ask short, plain-language follow-up questions until you can confidently suggest what TYPE of doctor to see.
Once you have enough information, set recommendedSpecialty and summary; otherwise leave them null and keep asking.
${commitRule}

${specialtyRules}

Respond with ONLY a JSON object, no prose outside it, matching exactly this shape:
{
  "reply": string,                 // what to show the patient next (a question or the final message)
  "detectedSymptoms": string[],    // symptoms mentioned so far, in the patient's own terms
  "urgencyTag": "Routine" | "Soon" | "Urgent",
  "recommendedSpecialty": string | null,  // one of the specialties listed above - null until you're confident
  "summary": string | null         // 2-3 sentence handoff summary for the doctor - null until recommendedSpecialty is set
}`;
}

@Injectable()
export class GroqService implements OnModuleInit {
  private client: Groq | null = null;
  private model = 'llama-3.3-70b-versatile';
  private temperature = 0.4;

  constructor(private prisma: PrismaService, private config: ConfigService) {}

  async onModuleInit() {
    await this.refresh();
  }

  /** Rebuilds the in-memory Groq client from SystemSettings — called on boot and
   * whenever the admin saves new settings, so no server restart is required. */
  async refresh() {
    const settings = await this.prisma.systemSettings.findUnique({ where: { id: SETTINGS_ID } });
    if (!settings?.groqApiKeyEncrypted) {
      this.client = null;
      return;
    }

    const encryptionKey = this.requireEncryptionKey();
    const apiKey = decryptSecret(settings.groqApiKeyEncrypted, encryptionKey);
    this.client = new Groq({ apiKey });
    this.model = settings.groqModel;
    this.temperature = settings.groqTemperature;
  }

  async getPublicSettings() {
    const settings = await this.prisma.systemSettings.findUnique({ where: { id: SETTINGS_ID } });
    return {
      hasKey: !!settings?.groqApiKeyEncrypted,
      model: settings?.groqModel ?? this.model,
      temperature: settings?.groqTemperature ?? this.temperature,
    };
  }

  async updateSettings(dto: UpdateGroqSettingsDto) {
    const data: { groqApiKeyEncrypted?: string; groqModel?: string; groqTemperature?: number } = {};

    if (dto.apiKey !== undefined) {
      data.groqApiKeyEncrypted = dto.apiKey === '' ? undefined : encryptSecret(dto.apiKey, this.requireEncryptionKey());
    }
    if (dto.model !== undefined) data.groqModel = dto.model;
    if (dto.temperature !== undefined) data.groqTemperature = dto.temperature;

    await this.prisma.systemSettings.upsert({
      where: { id: SETTINGS_ID },
      update: data,
      create: {
        id: SETTINGS_ID,
        groqModel: dto.model ?? this.model,
        groqTemperature: dto.temperature ?? this.temperature,
        ...(data.groqApiKeyEncrypted ? { groqApiKeyEncrypted: data.groqApiKeyEncrypted } : {}),
      },
    });

    await this.refresh();
    return this.getPublicSettings();
  }

  /** Minimal live call to confirm the stored key/model actually works, for the
   * Admin panel's "Test Connection" button. */
  async testConnection(): Promise<{ ok: boolean; message: string }> {
    if (!this.client) {
      return { ok: false, message: 'No Groq API key configured.' };
    }
    try {
      await this.client.chat.completions.create({
        model: this.model,
        messages: [{ role: 'user', content: 'ping' }],
        max_tokens: 5,
      });
      return { ok: true, message: `Connected — model "${this.model}" responded.` };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return { ok: false, message };
    }
  }

  async runTriageTurn(
    history: { role: 'user' | 'assistant'; content: string }[],
    availableSpecialties: string[] = [],
  ): Promise<TriageTurn> {
    if (!this.client) {
      throw new ServiceUnavailableException(
        'AI triage is not configured yet — an admin needs to add a Groq API key in Settings.',
      );
    }

    const completion = await this.client.chat.completions.create({
      model: this.model,
      temperature: this.temperature,
      messages: [
        {
          role: 'system',
          content: buildSystemPrompt(availableSpecialties, history.filter((m) => m.role === 'user').length),
        },
        ...history,
      ],
      response_format: { type: 'json_object' },
    });

    const raw = completion.choices[0]?.message?.content ?? '{}';

    try {
      const parsed = JSON.parse(raw);
      let reply = String(parsed.reply ?? "Sorry, I didn't catch that - could you say more about how you're feeling?");
      let recommendedSpecialty: string | null = null;

      if (typeof parsed.recommendedSpecialty === 'string' && parsed.recommendedSpecialty.trim()) {
        // Snap the AI's wording onto a specialty real doctors have, so the booking step can find them.
        const resolved = resolveSpecialty(parsed.recommendedSpecialty, availableSpecialties);
        recommendedSpecialty = resolved.specialty;
        if (resolved.usedFallback) {
          reply += ` (There is no ${parsed.recommendedSpecialty.trim()} available right now, so I've matched you with a ${resolved.specialty} who can assess you and refer you if needed.)`;
        }
      }

      return {
        reply,
        detectedSymptoms: Array.isArray(parsed.detectedSymptoms) ? parsed.detectedSymptoms : [],
        urgencyTag: ['Routine', 'Soon', 'Urgent'].includes(parsed.urgencyTag) ? parsed.urgencyTag : 'Routine',
        recommendedSpecialty,
        // A summary only makes sense once there is a specialty to hand it to.
        summary: recommendedSpecialty ? (parsed.summary ?? null) : null,
      };
    } catch {
      // Model didn't return valid JSON despite json_object mode — degrade gracefully
      // rather than 500ing the whole conversation.
      return {
        reply: raw,
        detectedSymptoms: [],
        urgencyTag: 'Routine',
        recommendedSpecialty: null,
        summary: null,
      };
    }
  }

  /** Live model catalog for the admin settings dropdown — falls back to a hardcoded list on
   * the frontend if this fails (e.g. no key configured yet). */
  async listModels(): Promise<string[]> {
    if (!this.client) {
      throw new ServiceUnavailableException('No Groq API key configured yet.');
    }
    const response = await this.client.models.list();
    return response.data.map((m) => m.id).sort();
  }

  private requireEncryptionKey(): string {
    const key = this.config.get<string>('ENCRYPTION_KEY');
    if (!key) {
      throw new Error('ENCRYPTION_KEY is not set in the environment.');
    }
    return key;
  }
}
