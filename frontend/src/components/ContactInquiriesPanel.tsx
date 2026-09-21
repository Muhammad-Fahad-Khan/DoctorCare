import { useEffect, useState } from 'react';
import { Mail, Check } from 'lucide-react';
import { api, ContactInquiry } from '../lib/api';

export function ContactInquiriesPanel() {
  const [inquiries, setInquiries] = useState<ContactInquiry[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  function refresh() {
    api.listContactInquiries().then(setInquiries).catch(() => setError('Could not load inquiries.'));
  }

  useEffect(refresh, []);

  async function markHandled(id: string) {
    try {
      await api.markInquiryHandled(id);
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update this inquiry.');
    }
  }

  return (
    <div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {inquiries === null && <p className="text-sm text-royal/50">Loading…</p>}
      {inquiries?.length === 0 && <p className="text-sm text-royal/50">No inquiries yet.</p>}

      <div className="space-y-3">
        {inquiries?.map((inq) => (
          <div key={inq.id} className={`interactive-card p-4 ${inq.handled ? 'opacity-60' : ''}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="flex items-center gap-1.5 text-sm font-semibold text-royal">
                  <Mail size={13} className="text-magenta" /> {inq.name}
                </p>
                <p className="text-xs text-royal/50">{inq.email}</p>
              </div>
              {!inq.handled && (
                <button
                  onClick={() => markHandled(inq.id)}
                  className="flex items-center gap-1 rounded-full bg-wisteria/15 px-2.5 py-1 text-xs font-semibold text-wisteria transition-all duration-300 ease-docucare hover:bg-wisteria/25"
                >
                  <Check size={12} /> Mark handled
                </button>
              )}
            </div>
            <p className="mt-2 text-sm text-royal/70">{inq.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
