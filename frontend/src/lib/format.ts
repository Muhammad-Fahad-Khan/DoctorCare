// Small display helpers shared by the appointment screens.

/** "Dr. " prefix that doesn't double up when the doctor already registered as "Dr. Sarah Ahmed". */
export function doctorName(fullName: string | undefined | null): string {
  const name = (fullName ?? '').trim();
  if (!name) return 'your doctor';
  return /^dr\.?\s/i.test(name) ? name : `Dr. ${name}`;
}

// Mirrors the backend's join window (appointments.service.ts). The server is what actually enforces
// it - this only decides when to show the Join button and what hint text to display.
const JOIN_MINUTES_BEFORE = 10;
const JOIN_MINUTES_AFTER = 180;

export function joinWindow(scheduledAt: string) {
  const t = new Date(scheduledAt).getTime();
  return {
    opensAt: new Date(t - JOIN_MINUTES_BEFORE * 60_000),
    closesAt: new Date(t + JOIN_MINUTES_AFTER * 60_000),
  };
}

export function isInJoinWindow(appt: { status: string; scheduledAt: string; urgentMeeting?: boolean }): boolean {
  if (appt.status !== 'ACCEPTED') return false;
  // The doctor asked to meet right now - the room is open regardless of the booked time.
  if (appt.urgentMeeting) return true;
  const { opensAt, closesAt } = joinWindow(appt.scheduledAt);
  const now = Date.now();
  return now >= opensAt.getTime() && now <= closesAt.getTime();
}

export function formatWhen(iso: string | Date): string {
  return new Date(iso).toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function formatTime(iso: string | Date): string {
  return new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}
