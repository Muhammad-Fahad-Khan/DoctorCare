import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { X, AlertCircle, Video, CheckCircle2, MessageSquareText, Siren } from 'lucide-react';
import { api, AppointmentResponse } from '../lib/api';
import { formatTime, isInJoinWindow, joinWindow } from '../lib/format';

const URGENCY_STYLES: Record<string, string> = {
  Routine: 'bg-wisteria/15 text-wisteria',
  Soon: 'bg-orchid text-royal',
  Urgent: 'bg-magenta/15 text-magenta',
};

export function PatientBriefModal({
  appointment,
  onClose,
  onChanged,
}: {
  appointment: AppointmentResponse;
  onClose: () => void;
  onChanged: () => void;
}) {
  const [notes, setNotes] = useState(appointment.doctorNotes ?? '');
  const [savedNotes, setSavedNotes] = useState(appointment.doctorNotes ?? '');
  const [meetingUrl, setMeetingUrl] = useState(appointment.meetingUrl ?? '');
  const [savedUrl, setSavedUrl] = useState(appointment.meetingUrl ?? '');
  const [guidance, setGuidance] = useState(appointment.patientGuidance ?? '');
  const [savedGuidance, setSavedGuidance] = useState(appointment.patientGuidance ?? '');
  const [urgent, setUrgent] = useState(appointment.guidanceUrgent);
  const [savedUrgent, setSavedUrgent] = useState(appointment.guidanceUrgent);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const session = appointment.triageSession;

  async function act(fn: () => Promise<unknown>) {
    setBusy(true);
    setError(null);
    try {
      await fn();
      onChanged();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  }

  /** Like act(), but keeps the panel open and shows a confirmation - used for "Save" buttons. */
  async function save(fn: () => Promise<unknown>, done: string, after: () => void) {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await fn();
      after();
      setNotice(done);
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  }

  const notesDirty = notes !== savedNotes;
  const guidanceDirty = guidance.trim() !== savedGuidance || (guidance.trim() !== '' && urgent !== savedUrgent);
  const canGuide = ['PENDING', 'ACCEPTED', 'COMPLETED'].includes(appointment.status);
  const urlDirty = meetingUrl.trim() !== savedUrl;
  const inWindow = isInJoinWindow(appointment);

  // Portalled to <body> so no transformed / blurred ancestor (dashboard tab wrapper, cards) can
  // turn `fixed` into "fixed relative to that ancestor" and push the panel out of place.
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-royal/30 backdrop-blur-sm">
      <div className="glass-card h-full w-full max-w-md overflow-y-auto rounded-none p-6 shadow-2xl sm:rounded-l-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-royal">{appointment.patient.fullName}</h2>
          <button onClick={onClose} className="text-royal/40 hover:text-royal">
            <X size={20} />
          </button>
        </div>
        <p className="text-xs text-royal/50">
          {new Date(appointment.scheduledAt).toLocaleString(undefined, {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
          })}
        </p>

        {!session && (
          <div className="mt-6 flex items-center gap-2 rounded-xl bg-royal/5 p-4 text-sm text-royal/60">
            <AlertCircle size={16} /> This patient booked without going through the AI triage chat.
          </div>
        )}

        {session && (
          <div className="mt-6 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              {session.urgencyTag && (
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${URGENCY_STYLES[session.urgencyTag] ?? ''}`}>
                  {session.urgencyTag}
                </span>
              )}
              {session.recommendedSpecialty && (
                <span className="rounded-full bg-royal/5 px-2.5 py-1 text-xs font-semibold text-royal">
                  {session.recommendedSpecialty}
                </span>
              )}
            </div>

            {session.summary && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-royal/40">AI Summary</p>
                <p className="mt-1 text-sm leading-relaxed text-royal/80">{session.summary}</p>
              </div>
            )}

            {session.detectedSymptoms && session.detectedSymptoms.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-royal/40">Symptoms noted</p>
                <p className="mt-1 text-sm text-royal/80">{session.detectedSymptoms.join(', ')}</p>
              </div>
            )}

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-royal/40">Full conversation</p>
              <div className="mt-2 space-y-2 rounded-xl bg-royal/5 p-3">
                {session.messages.map((m, i) => (
                  <p key={i} className="text-xs text-royal/70">
                    <span className="font-semibold text-royal">{m.role === 'user' ? 'Patient: ' : 'AI: '}</span>
                    {m.content}
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        <div className="mt-6 border-t border-royal/10 pt-5">
          {canGuide && (
            <div className="mb-6">
              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-royal/40">
                <MessageSquareText size={13} /> Guidance for the patient
              </p>
              <textarea
                value={guidance}
                onChange={(e) => setGuidance(e.target.value)}
                rows={3}
                maxLength={2000}
                className="mt-1.5 w-full rounded-xl border border-royal/10 bg-white/70 px-3.5 py-2.5 text-sm outline-none transition-all duration-300 ease-docucare focus:border-magenta/50 focus:ring-2 focus:ring-magenta/20"
                placeholder="What should the patient do right now, before the consultation? e.g. rest, avoid heavy exertion, take medicine as directed, go to the ER if symptoms worsen…"
              />
              <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-royal/70">
                  <input
                    type="checkbox"
                    checked={urgent}
                    onChange={(e) => setUrgent(e.target.checked)}
                    className="h-4 w-4 rounded border-royal/20 accent-magenta"
                  />
                  Mark as urgent
                </label>
                <div className="flex gap-2">
                  {savedGuidance && (
                    <button
                      disabled={busy}
                      onClick={() =>
                        save(
                          () => api.setPatientGuidance(appointment.id, '', false),
                          'Guidance removed.',
                          () => {
                            setGuidance('');
                            setSavedGuidance('');
                            setUrgent(false);
                            setSavedUrgent(false);
                          },
                        )
                      }
                      className="rounded-full px-3 py-1.5 text-xs font-semibold text-royal/50 transition-colors hover:text-red-600 disabled:opacity-40"
                    >
                      Remove
                    </button>
                  )}
                  <button
                    disabled={busy || !guidance.trim() || !guidanceDirty}
                    onClick={() =>
                      save(
                        () => api.setPatientGuidance(appointment.id, guidance.trim(), urgent),
                        'Guidance sent — your patient can see it now.',
                        () => {
                          setGuidance(guidance.trim());
                          setSavedGuidance(guidance.trim());
                          setSavedUrgent(urgent);
                        },
                      )
                    }
                    className="btn-primary !px-4 !py-2 text-xs disabled:opacity-40"
                  >
                    {savedGuidance ? 'Update guidance' : 'Send to patient'}
                  </button>
                </div>
              </div>
              <p className="mt-1.5 text-xs text-royal/40">
                Shown to the patient on their appointment right away, until the consultation.
              </p>
            </div>
          )}

          {appointment.status === 'PENDING' && (
            <div className="flex gap-3">
              <button
                disabled={busy}
                onClick={() => act(() => api.updateAppointmentStatus(appointment.id, 'ACCEPTED'))}
                className="btn-primary flex-1 disabled:opacity-50"
              >
                Accept
              </button>
              <button
                disabled={busy}
                onClick={() => act(() => api.updateAppointmentStatus(appointment.id, 'REJECTED'))}
                className="btn-secondary flex-1 disabled:opacity-50"
              >
                Decline
              </button>
            </div>
          )}

          {appointment.status === 'ACCEPTED' && (
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-royal/40">Video consultation</p>

              {appointment.urgentMeeting ? (
                <div className="mt-2 rounded-xl border border-magenta/40 bg-magenta/5 p-3">
                  <p className="flex items-center gap-1.5 text-xs font-semibold text-magenta">
                    <Siren size={14} /> Urgent call is live
                  </p>
                  <p className="mt-1 text-xs text-royal/60">
                    Your patient can see a "Join video call now" link on their dashboard. Join the call below and they will
                    meet you there.
                  </p>
                  <button
                    disabled={busy}
                    onClick={() => save(() => api.endUrgentMeeting(appointment.id), 'Urgent request cancelled.', () => {})}
                    className="mt-2 text-xs font-semibold text-royal/50 transition-colors hover:text-red-600 disabled:opacity-40"
                  >
                    Cancel urgent request
                  </button>
                </div>
              ) : (
                <div className="mt-2">
                  <button
                    disabled={busy}
                    onClick={() =>
                      save(
                        () => api.startUrgentMeeting(appointment.id),
                        'Urgent meeting started — your patient now sees a Join link.',
                        () => {},
                      )
                    }
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-magenta/40 bg-magenta/5 px-4 py-2.5 text-sm font-semibold text-magenta transition-all duration-300 ease-docucare hover:bg-magenta/10 disabled:opacity-50"
                  >
                    <Siren size={15} /> Meet patient now (urgent)
                  </button>
                  <p className="mt-1.5 text-xs text-royal/40">
                    Opens the call room right away and shows the patient a link to join, instead of waiting for the booked time.
                  </p>
                </div>
              )}

              {inWindow ? (
                <Link to={`/consultation/${appointment.id}`} className="btn-primary mt-2 flex w-full items-center justify-center">
                  <Video size={15} className="mr-2" /> Join video call now
                </Link>
              ) : (
                <p className="mt-2 flex items-center gap-2 rounded-xl bg-royal/5 px-3.5 py-2.5 text-xs text-royal/60">
                  <Video size={14} className="shrink-0" />
                  {new Date() < joinWindow(appointment.scheduledAt).opensAt
                    ? `The call room opens at ${formatTime(joinWindow(appointment.scheduledAt).opensAt)} (10 minutes before the appointment). A Join button will appear here and in your queue.`
                    : 'The call window for this appointment has closed.'}
                </p>
              )}

              <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-royal/40">
                Zoom / Google Meet link <span className="font-normal normal-case">(optional)</span>
              </label>
              <div className="mt-1.5 flex gap-2">
                <input
                  value={meetingUrl}
                  onChange={(e) => setMeetingUrl(e.target.value)}
                  placeholder="https://meet.google.com/abc-defg-hij"
                  className="min-w-0 flex-1 rounded-xl border border-royal/10 bg-white/70 px-3.5 py-2.5 text-sm outline-none transition-all duration-300 ease-docucare focus:border-magenta/50 focus:ring-2 focus:ring-magenta/20"
                />
                <button
                  disabled={busy || !urlDirty}
                  onClick={() =>
                    save(
                      () => api.setMeetingLink(appointment.id, meetingUrl.trim()),
                      meetingUrl.trim() ? 'Meeting link saved.' : 'Meeting link removed.',
                      () => setSavedUrl(meetingUrl.trim()),
                    )
                  }
                  className="btn-secondary shrink-0 !px-4 !py-2 text-xs disabled:opacity-40"
                >
                  Save link
                </button>
              </div>
              <p className="mt-1.5 text-xs text-royal/40">
                {savedUrl
                  ? 'Your patient will be sent to this link when they join. Clear it to use the built-in video room instead.'
                  : 'Leave empty to use the built-in DocuCare video room. Patients join from their dashboard when the call opens.'}
              </p>
            </div>
          )}

          {(appointment.status === 'ACCEPTED' || appointment.status === 'COMPLETED') && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-royal/40">
                Consultation notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="mt-1.5 w-full rounded-xl border border-royal/10 bg-white/70 px-3.5 py-2.5 text-sm outline-none transition-all duration-300 ease-docucare focus:border-magenta/50 focus:ring-2 focus:ring-magenta/20"
                placeholder="Diagnosis, prescription, follow-up…"
              />
              <div className="mt-3 flex gap-3">
                <button
                  disabled={busy || !notesDirty}
                  onClick={() =>
                    save(
                      () => api.saveAppointmentNotes(appointment.id, notes),
                      'Notes saved.',
                      () => setSavedNotes(notes),
                    )
                  }
                  className="btn-secondary flex-1 disabled:opacity-40"
                >
                  Save notes
                </button>
                {appointment.status === 'ACCEPTED' && (
                  <button
                    disabled={busy}
                    onClick={() => act(() => api.completeAppointment(appointment.id, notes))}
                    className="btn-primary flex-1 disabled:opacity-50"
                  >
                    Mark Completed
                  </button>
                )}
              </div>
              {appointment.status === 'ACCEPTED' && (
                <p className="mt-2 text-xs text-royal/40">
                  Save notes keeps the appointment open. Mark Completed saves your notes and closes it.
                </p>
              )}
            </div>
          )}

          {notice && (
            <p className="mt-3 flex items-center gap-1.5 text-sm font-medium text-wisteria">
              <CheckCircle2 size={15} /> {notice}
            </p>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
