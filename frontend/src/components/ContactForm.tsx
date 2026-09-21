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
      <div className="glass-card flex h-full min-h-[320px] flex-col items-center justify-center gap-3 p-10 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-mint/15 text-mint">
          <CheckCircle2 size={28} />
        </span>
        <p className="text-lg font-bold text-royal">Message sent</p>
        <p className="text-sm text-royal/60">Thanks for reaching out — we'll get back to you shortly.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="glass-card space-y-5 p-6 sm:p-8">
      <div>
        <h2 className="text-lg font-bold text-royal">Send us a message</h2>
        <p className="mt-1 text-sm text-royal/55">We usually reply within one business day.</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block text-sm font-medium text-royal/80">
          Name
          <input required value={name} onChange={(e) => setName(e.target.value)} className="input-field mt-1.5" />
        </label>
        <label className="block text-sm font-medium text-royal/80">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field mt-1.5"
          />
        </label>
      </div>

      <label className="block text-sm font-medium text-royal/80">
        Message
        <textarea
          required
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="input-field mt-1.5 resize-none"
        />
      </label>

      {error && (
        <p role="alert" className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-600">
          {error}
        </p>
      )}

      <button type="submit" disabled={submitting} className="btn-primary w-full !py-3.5 disabled:opacity-60">
        {submitting ? (
          'Sending…'
        ) : (
          <>
            <Send size={15} /> Send message
          </>
        )}
      </button>
    </form>
  );
}
