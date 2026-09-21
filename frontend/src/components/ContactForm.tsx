import { FormEvent, useState } from 'react';
import { Send, CheckCircle2 } from 'lucide-react';
import { api } from '../lib/api';

export function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await api.submitContactInquiry({ name, email, message });
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send your message.');
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <div className="glass-card flex flex-col items-center gap-2 p-8 text-center">
        <CheckCircle2 className="text-magenta" size={26} />
        <p className="text-sm font-semibold text-royal">Message sent</p>
        <p className="text-sm text-royal/60">We'll get back to you shortly.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="glass-card space-y-4 p-6">
      <label className="block text-sm font-medium text-royal/80">
        Name
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1.5 w-full rounded-xl border border-royal/10 bg-white/70 px-3.5 py-2.5 text-sm outline-none transition-all duration-300 ease-docucare focus:border-magenta/50 focus:ring-2 focus:ring-magenta/20"
        />
      </label>
      <label className="block text-sm font-medium text-royal/80">
        Email
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1.5 w-full rounded-xl border border-royal/10 bg-white/70 px-3.5 py-2.5 text-sm outline-none transition-all duration-300 ease-docucare focus:border-magenta/50 focus:ring-2 focus:ring-magenta/20"
        />
      </label>
      <label className="block text-sm font-medium text-royal/80">
        Message
        <textarea
          required
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="mt-1.5 w-full rounded-xl border border-royal/10 bg-white/70 px-3.5 py-2.5 text-sm outline-none transition-all duration-300 ease-docucare focus:border-magenta/50 focus:ring-2 focus:ring-magenta/20"
        />
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={submitting} className="btn-primary w-full disabled:opacity-60">
        {submitting ? 'Sending…' : (<><Send size={14} className="mr-1.5 inline" /> Send message</>)}
      </button>
    </form>
  );
}
