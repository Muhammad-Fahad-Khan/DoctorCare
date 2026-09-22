import { useEffect, useState } from 'react';
import { ArrowLeft, Calendar, CheckCircle2 } from 'lucide-react';
import { api, DoctorListing, AvailabilitySlot, AppointmentResponse } from '../lib/api';
import { matches } from '../lib/search';
import { Highlight, NoResults, SearchBar } from './SearchBar';

function formatSlot(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function DoctorBooking({
  specialty,
  triageSessionId,
  onDone,
}: {
  specialty: string;
  triageSessionId: string;
  onDone: (appointment: AppointmentResponse) => void;
}) {
  const [doctors, setDoctors] = useState<DoctorListing[] | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorListing | null>(null);
  const [slots, setSlots] = useState<AvailabilitySlot[] | null>(null);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    setDoctors(null);
    setError(null);
    api
      .listDoctors(showAll ? undefined : specialty)
      .then(setDoctors)
      .catch(() => setError('Could not load doctors. Please try again.'));
  }, [specialty, showAll]);

  useEffect(() => {
    if (!selectedDoctor) return;
    setSlots(null);
    api
      .listDoctorAvailability(selectedDoctor.id)
      .then(setSlots)
      .catch(() => setError('Could not load this doctor\'s availability.'));
  }, [selectedDoctor]);

  async function confirmBooking(slotId: string) {
    setBooking(true);
    setError(null);
    try {
      const appointment = await api.bookAppointment({ slotId, triageSessionId });
      onDone(appointment);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not book this slot — it may have just been taken.');
      // Refresh slots since booking likely failed due to a race with another patient.
      if (selectedDoctor) api.listDoctorAvailability(selectedDoctor.id).then(setSlots);
    } finally {
      setBooking(false);
    }
  }

  // ---- Step 2: pick a time slot ----
  if (selectedDoctor) {
    return (
      <div className="interactive-card p-5">
        <button
          onClick={() => setSelectedDoctor(null)}
          className="flex items-center gap-1.5 text-xs font-semibold text-royal/50 transition-colors hover:text-royal"
        >
          <ArrowLeft size={14} /> Back to doctors
        </button>

        <p className="mt-3 text-sm font-semibold text-royal">{selectedDoctor.user.fullName}</p>
        <p className="text-xs text-royal/50">{selectedDoctor.specialty}</p>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <div className="mt-4 space-y-2">
          {slots === null && <p className="text-sm text-royal/50">Loading availability…</p>}
          {slots?.length === 0 && (
            <p className="text-sm text-royal/50">No open slots right now — try another doctor.</p>
          )}
          {slots?.map((slot) => (
            <button
              key={slot.id}
              disabled={booking}
              onClick={() => confirmBooking(slot.id)}
              className="flex w-full items-center justify-between rounded-xl border border-royal/10 bg-white/70 px-4 py-2.5 text-sm transition-all duration-300 ease-docucare hover:border-magenta/40 hover:bg-orchid/10 disabled:opacity-50"
            >
              <span className="flex items-center gap-2 text-royal/80">
                <Calendar size={14} className="text-wisteria" />
                {formatSlot(slot.startTime)}
              </span>
              <span className="text-xs font-semibold text-magenta">Book</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ---- Step 1: pick a doctor ----
  const shownDoctors = doctors?.filter((d) => matches(query, d.user.fullName, d.specialty, d.bio));

  return (
    <div className="interactive-card p-5">
      <p className="text-sm font-semibold text-royal">
        {showAll ? 'All available doctors' : `Doctors matching "${specialty}"`}
      </p>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      {doctors === null && !error && <p className="mt-3 text-sm text-royal/50">Loading doctors…</p>}
      {doctors?.length === 0 && (
        <p className="mt-3 text-sm text-royal/50">
          {showAll
            ? 'No approved doctors are registered yet.'
            : `No approved ${specialty} is registered right now — you can still see everyone who is available below.`}
        </p>
      )}

      <SearchBar className="mt-3" value={query} onChange={setQuery} placeholder="Search doctors by name or specialty…" />
      {doctors && doctors.length > 0 && shownDoctors?.length === 0 && (
        <NoResults query={query} onClear={() => setQuery('')} />
      )}

      <div className="mt-3 space-y-2">
        {shownDoctors?.map((doc) => (
          <button
            key={doc.id}
            onClick={() => setSelectedDoctor(doc)}
            disabled={doc.openSlots === 0}
            className="flex w-full items-center justify-between rounded-xl border border-royal/10 bg-white/70 px-4 py-3 text-left text-sm transition-all duration-300 ease-docucare hover:border-magenta/40 hover:bg-orchid/10 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-royal/10 disabled:hover:bg-white/70"
          >
            <span>
              <span className="block font-medium text-royal">
                <Highlight text={doc.user.fullName} query={query} />
              </span>
              <span className="text-xs text-royal/50">
                {doc.specialty}
                {doc.yearsExperience ? ` · ${doc.yearsExperience} yrs experience` : ''}
              </span>
            </span>
            <span className="flex shrink-0 items-center gap-2">
              <span className={`text-xs font-semibold ${doc.openSlots ? 'text-magenta' : 'text-royal/40'}`}>
                {doc.openSlots ? `${doc.openSlots} open slot${doc.openSlots === 1 ? '' : 's'}` : 'No open slots'}
              </span>
              <CheckCircle2 size={16} className="text-wisteria" />
            </span>
          </button>
        ))}
      </div>

      {(doctors !== null || error) && (
        <button
          onClick={() => setShowAll((v) => !v)}
          className="mt-4 text-xs font-semibold text-magenta transition-opacity hover:opacity-70"
        >
          {showAll ? `Only show ${specialty} doctors` : 'Show all doctors'}
        </button>
      )}
    </div>
  );
}
