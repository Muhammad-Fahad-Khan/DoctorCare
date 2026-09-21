import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Video } from 'lucide-react';
import { api, AppointmentResponse } from '../lib/api';
import { doctorName } from '../lib/format';

const POLL_MS = 10_000;

// Shown at the top of the patient dashboard, on every tab. It polls quietly so a patient sees
// "your doctor wants to meet you now" within seconds, without having to refresh the page.
export function UrgentCallBanner() {
  const [live, setLive] = useState<AppointmentResponse[]>([]);

  useEffect(() => {
    let stopped = false;
    async function check() {
      try {
        const all = await api.listMyAppointments();
        if (!stopped) setLive(all.filter((a) => a.status === 'ACCEPTED' && a.urgentMeeting));
      } catch {
        // Transient network / auth error: keep whatever we last showed and try again next tick.
      }
    }
    check();
    const timer = setInterval(check, POLL_MS);
    return () => {
      stopped = true;
      clearInterval(timer);
    };
  }, []);

  if (live.length === 0) return null;

  return (
    <div className="mt-6 space-y-3" role="alert">
      {live.map((appt) => (
        <div
          key={appt.id}
          className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-magenta/40 bg-magenta/5 p-4 shadow-glow-magenta"
        >
          <div className="flex items-start gap-3">
            <span className="relative mt-1 flex h-3 w-3 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-magenta opacity-60" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-magenta" />
            </span>
            <div>
              <p className="text-sm font-bold text-royal">{doctorName(appt.doctor?.fullName)} wants to meet you now</p>
              <p className="text-xs text-royal/60">Your video call is open. Please join as soon as you can.</p>
            </div>
          </div>
          <Link to={`/consultation/${appt.id}`} className="btn-primary inline-flex items-center !px-5 !py-2 text-sm">
            <Video size={15} className="mr-2" /> Join video call now
          </Link>
        </div>
      ))}
    </div>
  );
}
