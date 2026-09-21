import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Video } from 'lucide-react';
import { api, AppointmentResponse } from '../lib/api';
import { PatientBriefModal } from './PatientBriefModal';
import { isInJoinWindow } from '../lib/format';

const STATUS_STYLES: Record<AppointmentResponse['status'], string> = {
  PENDING: 'bg-orchid text-royal',
  ACCEPTED: 'bg-wisteria/15 text-wisteria',
  COMPLETED: 'bg-royal/10 text-royal/60',
  REJECTED: 'bg-red-50 text-red-600',
  CANCELLED: 'bg-royal/5 text-royal/40',
};

const TABS = ['Pending', 'Accepted', 'Completed', 'All'] as const;

export function AppointmentQueue() {
  const [appointments, setAppointments] = useState<AppointmentResponse[] | null>(null);
  const [tab, setTab] = useState<(typeof TABS)[number]>('Pending');
  const [openId, setOpenId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function refresh() {
    api
      .listMyAppointments()
      .then(setAppointments)
      .catch(() => setError('Could not load your appointment queue.'));
  }

  useEffect(refresh, []);

  // Looked up by id so the open panel always reflects the freshest data after a save.
  const open = appointments?.find((a) => a.id === openId) ?? null;

  const visible = appointments?.filter((a) => (tab === 'All' ? true : a.status === tab.toUpperCase()));

  return (
    <div>
      <div className="flex gap-2">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-300 ease-docucare ${
              tab === t ? 'bg-magenta text-white' : 'bg-royal/5 text-royal/60 hover:bg-royal/10'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      {appointments === null && <p className="mt-4 text-sm text-royal/50">Loading…</p>}
      {visible?.length === 0 && <p className="mt-4 text-sm text-royal/50">Nothing here.</p>}

      <div className="mt-4 space-y-3">
        {visible?.map((appt) => (
          <div
            key={appt.id}
            role="button"
            tabIndex={0}
            onClick={() => setOpenId(appt.id)}
            onKeyDown={(e) => e.key === 'Enter' && setOpenId(appt.id)}
            className="interactive-card flex w-full cursor-pointer items-center justify-between p-4 text-left"
          >
            <div>
              <p className="text-sm font-semibold text-royal">{appt.patient.fullName}</p>
              <p className="text-xs text-royal/50">
                {new Date(appt.scheduledAt).toLocaleString(undefined, {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })}
                {appt.triageSession?.recommendedSpecialty ? ` · ${appt.triageSession.recommendedSpecialty}` : ''}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {isInJoinWindow(appt) && (
                <Link
                  to={`/consultation/${appt.id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="btn-primary !px-3 !py-1.5 text-xs"
                >
                  <Video size={13} className="mr-1.5" /> Join
                </Link>
              )}
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[appt.status]}`}>
                {appt.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      {open && (
        <PatientBriefModal
          appointment={open}
          onClose={() => setOpenId(null)}
          onChanged={refresh}
        />
      )}
    </div>
  );
}
