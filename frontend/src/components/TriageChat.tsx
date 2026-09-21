import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User as UserIcon } from 'lucide-react';
import { api, TriageSessionResponse } from '../lib/api';

const URGENCY_STYLES: Record<string, string> = {
  Routine: 'bg-wisteria/15 text-wisteria',
  Soon: 'bg-orchid text-royal',
  Urgent: 'bg-magenta/15 text-magenta',
};

export function TriageChat({
  onRecommendation,
}: {
  onRecommendation: (specialty: string, triageSessionId: string) => void;
}) {
  const [session, setSession] = useState<TriageSessionResponse | null>(null);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session?.messages.length, sending]);

  async function send() {
    const message = input.trim();
    if (!message || sending) return;
    setInput('');
    setError(null);
    setSending(true);
    try {
      const updated = session
        ? await api.continueTriage(session.id, message)
        : await api.startTriage(message);
      setSession(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="glass-card flex h-[560px] flex-col overflow-hidden">
      <div className="flex-1 space-y-4 overflow-y-auto p-5">
        {!session && (
          <div className="flex items-start gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-magenta/10 text-magenta">
              <Bot size={16} />
            </div>
            <div className="rounded-2xl rounded-tl-sm bg-royal/5 px-4 py-2.5 text-sm text-royal/80">
              Tell me what you're feeling, in your own words — I'll help you figure out what kind of doctor to see.
            </div>
          </div>
        )}

        {session?.messages.map((m, i) => (
          <div key={i} className={`flex items-start gap-2.5 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                m.role === 'user' ? 'bg-wisteria/15 text-wisteria' : 'bg-magenta/10 text-magenta'
              }`}
            >
              {m.role === 'user' ? <UserIcon size={16} /> : <Bot size={16} />}
            </div>
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                m.role === 'user'
                  ? 'rounded-tr-sm bg-magenta text-white'
                  : 'rounded-tl-sm bg-royal/5 text-royal/80'
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}

        {sending && (
          <div className="flex items-center gap-2.5 text-sm text-royal/40">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-magenta/10 text-magenta">
              <Bot size={16} />
            </div>
            <span className="flex gap-1">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-royal/30 [animation-delay:-0.3s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-royal/30 [animation-delay:-0.15s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-royal/30" />
            </span>
          </div>
        )}

        {session?.recommendedSpecialty && (
          <div className="interactive-card space-y-2.5 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-royal/40">Triage summary</p>

            {session.detectedSymptoms && session.detectedSymptoms.length > 0 && (
              <p className="text-sm text-royal/70">
                <span className="font-medium text-royal">Symptoms noted:</span>{' '}
                {session.detectedSymptoms.join(', ')}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-2">
              {session.urgencyTag && (
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    URGENCY_STYLES[session.urgencyTag] ?? URGENCY_STYLES.Routine
                  }`}
                >
                  {session.urgencyTag}
                </span>
              )}
              <span className="rounded-full bg-royal/5 px-2.5 py-1 text-xs font-semibold text-royal">
                Recommended: {session.recommendedSpecialty}
              </span>
            </div>

            <button
              onClick={() => onRecommendation(session.recommendedSpecialty!, session.id)}
              className="btn-primary mt-1 w-full !py-2.5 text-sm"
            >
              Book a Doctor
            </button>
          </div>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="flex items-center gap-2 border-t border-royal/10 p-3"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe how you're feeling…"
          className="flex-1 rounded-full border border-royal/10 bg-white/70 px-4 py-2.5 text-sm outline-none transition-all duration-300 ease-docucare focus:border-magenta/50 focus:ring-2 focus:ring-magenta/20"
        />
        <button
          type="submit"
          disabled={sending || !input.trim()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-magenta text-white transition-all duration-300 ease-docucare hover:shadow-glow-magenta disabled:opacity-40"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
