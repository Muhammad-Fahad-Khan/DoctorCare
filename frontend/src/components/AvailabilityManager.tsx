import { useEffect, useState, FormEvent } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { api, AvailabilitySlot } from '../lib/api';

// datetime-local inputs give local time with no timezone suffix — new Date() on that
// string parses it as local time, then .toISOString() converts to UTC for the API.
function toIso(localValue: string) {
  return new Date(localValue).toISOString();
}

export function AvailabilityManager() {
  const [slots, setSlots] = useState<AvailabilitySlot[] | null>(null);
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function refresh() {
    api
      .listMyAvailability()
      .then(setSlots)
      .catch(() => setError('Could not load your availability.'));
  }

  useEffect(refresh, []);

  async function add(e: FormEvent) {
    e.preventDefault();
    if (!start || !end) return;
    setSubmitting(true);
    setError(null);
    try {
      await api.createAvailability({ startTime: toIso(start), endTime: toIso(end) });
      setStart('');
      setEnd('');
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add this slot.');
    } finally {
      setSubmitting(false);
    }
  }

  async function remove(id: string) {
    try {
      await api.deleteAvailability(id);
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not remove this slot.');
    }
  }

  return (
    <div>
      <form onSubmit={add} className="interactive-card flex flex-wrap items-end gap-3 p-4">
        <label className="text-sm text-royal/70">
          Start
          <input
            type="datetime-local"
            required
            value={start}
            onChange={(e) => setStart(e.target.value)}
            className="mt-1 block rounded-xl border border-royal/10 bg-white/70 px-3 py-2 text-sm outline-none transition-all duration-300 ease-docucare focus:border-magenta/50 focus:ring-2 focus:ring-magenta/20"
          />
        </label>
        <label className="text-sm text-royal/70">
          End
          <input
            type="datetime-local"
            required
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            className="mt-1 block rounded-xl border border-royal/10 bg-white/70 px-3 py-2 text-sm outline-none transition-all duration-300 ease-docucare focus:border-magenta/50 focus:ring-2 focus:ring-magenta/20"
          />
        </label>
        <button type="submit" disabled={submitting} className="btn-primary !px-4 !py-2 text-sm disabled:opacity-50">
          <Plus size={15} className="mr-1.5 inline" /> Add slot
        </button>
      </form>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <div className="mt-5 space-y-2">
        {slots === null && <p className="text-sm text-royal/50">Loading…</p>}
        {slots?.length === 0 && <p className="text-sm text-royal/50">No slots yet — add one above.</p>}
        {slots?.map((slot) => (
          <div
            key={slot.id}
            className="flex items-center justify-between rounded-xl border border-royal/10 bg-white/70 px-4 py-2.5 text-sm"
          >
            <span className="text-royal/80">
              {new Date(slot.startTime).toLocaleString(undefined, {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              })}{' '}
              – {new Date(slot.endTime).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
            </span>
            {slot.isBooked ? (
              <span className="rounded-full bg-wisteria/15 px-2.5 py-1 text-xs font-semibold text-wisteria">Booked</span>
            ) : (
              <button
                onClick={() => remove(slot.id)}
                className="flex h-7 w-7 items-center justify-center rounded-full text-royal/40 transition-colors hover:bg-red-50 hover:text-red-600"
                aria-label="Remove slot"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
