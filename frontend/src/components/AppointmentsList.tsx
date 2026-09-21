import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, MessageSquareText, Video, X } from 'lucide-react';
import { api, AppointmentResponse } from '../lib/api';
import { doctorName, formatTime, formatWhen, isInJoinWindow, joinWindow } from '../lib/format';

const STATUS_STYLES: Record<AppointmentResponse['status'], string> = {
  PENDING: 'bg-orchid text-royal',
  ACCEPTED: 'bg-wisteria/15 text-wisteria',
  COMPLETED: 'bg-royal/10 text-royal/60',
  REJECTED: 'bg-red-50 text-red-600',
  CANCELLED: 'bg-royal/5 text-royal/40',
};

const FILTERS = ['All', 'Pending', 'Accepted', 'Completed'] as const;

export function AppointmentsList() {
  const [appointments, setAppointments] = useState<AppointmentResponse[] | null>(null);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('All');
  const [error, setError] = useState<string | null>(null);

  function refresh() {
    api
      .listMyAppointments()
      .then(setAppointments)
      .catch(() => setError('Could not load your appointments.'));
  }

  useEffect(() => {
    refresh();
    const timer = setInterval(refresh, 15_000);
    return () => clearInterval(timer);
  }, []);

  async function cancel(id: string) {
    try {
      await api.cancelAppointment(id);
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not cancel this appointment.');
    }
  }

  const visible = appointments?.filter((a) =>
    filter === 'All' ? true : a.status === filter.toUpperCase(),
  );

  return (
    <div>
      <div className="flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-300 ease-docucare ${
              filter === f ? 'bg-magenta text-white' : 'bg-royal/5 text-royal/60 hover:bg-royal/10'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      {appointments === null && <p className="mt-4 text-sm text-royal/50">Loading…</p>}
      {visible?.length === 0 && <p className="mt-4 text-sm text-royal/50">Nothing here yet.</p>}

      <div className="mt-4 space-y-3">
        {visible?.map((appt) => (
          <div key={appt.id} className="interactive-card p-4">
            <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-royal">{doctorName(appt.doctor.fullName)}</p>
              <p className="text-xs text-royal/50">
                {new Date(appt.scheduledAt).toLocaleString(undefined, {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </p>
              {appt.status === 'ACCEPTED' && !isInJoinWindow(appt) && new Date() < joinWindow(appt.scheduledAt).opensAt && (
                <p className="mt-0.5 flex items-center gap-1 text-xs text-wisteria">
                  <Video size={11} /> Video call opens at {formatTime(joinWindow(appt.scheduledAt).opensAt)}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[appt.status]}`}>
                {appt.status}
              </span>

              {isInJoinWindow(appt) && (
                <Link to={`/consultation/${appt.id}`} className="btn-primary !px-3 !py-1.5 text-xs">
                  <Video size={13} className="mr-1.5" /> Join
                </Link>
              )}

              {(appt.status === 'PENDING' || appt.status === 'ACCEPTED') && (
                <button
                  onClick={() => cancel(appt.id)}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-royal/40 transition-colors hover:bg-red-50 hover:text-red-600"
                  aria-label="Cancel appointment"
                >
                  <X size={15} />
                </button>
              )}
            </div>
            </div>

            {appt.patientGuidance && (
              <div
                className={`mt-3 rounded-xl border p-3.5 ${
                  appt.guidanceUrgent ? 'border-magenta/40 bg-magenta/5' : 'border-wisteria/30 bg-wisteria/5'
                }`}
              >
                <p
                  className={`flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide ${
                    appt.guidanceUrgent ? 'text-magenta' : 'text-wisteria'
                  }`}
                >
                  {appt.guidanceUrgent ? <AlertTriangle size={13} /> : <MessageSquareText size={13} />}
                  {appt.guidanceUrgent ? 'Urgent message from your doctor' : 'Message from your doctor'}
                </p>
                <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-royal/80">{appt.patientGuidance}</p>
                <p className="mt-2 text-xs text-royal/40">
                  {appt.guidanceUpdatedAt ? `Updated ${formatWhen(appt.guidanceUpdatedAt)} · ` : ''}
                  If you feel worse or it's an emergency, seek emergency care right away.
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
