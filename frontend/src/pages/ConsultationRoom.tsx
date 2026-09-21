import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { JitsiMeeting } from '@jitsi/react-sdk';
import { ArrowLeft, AlertCircle, ExternalLink, Video } from 'lucide-react';
import { api, AppointmentResponse } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { doctorName } from '../lib/format';

export function ConsultationRoom() {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const { user } = useAuth();
  const [appointment, setAppointment] = useState<AppointmentResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!appointmentId) return;
    api
      .getAppointment(appointmentId)
      .then(setAppointment)
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load this appointment.'));
  }, [appointmentId]);

  if (error) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-6 text-center">
        <AlertCircle className="text-red-500" size={28} />
        <p className="text-sm text-royal/60">{error}</p>
        <Link to="/" className="btn-secondary !px-4 !py-2 text-xs">Back to home</Link>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-magenta border-t-transparent" />
      </div>
    );
  }

  if (appointment.status !== 'ACCEPTED') {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-6 text-center">
        <AlertCircle className="text-royal/40" size={28} />
        <p className="text-sm text-royal/60">
          {appointment.status === 'PENDING'
            ? "This appointment hasn't been accepted by the doctor yet."
            : `This appointment is ${appointment.status.toLowerCase()} and can't be joined.`}
        </p>
        <Link to={user?.role === 'DOCTOR' ? '/doctor' : '/patient'} className="btn-secondary !px-4 !py-2 text-xs">
          Back to dashboard
        </Link>
      </div>
    );
  }

  if (!appointment.canJoin || !appointment.jitsiRoomName) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-6 text-center">
        <AlertCircle className="text-royal/40" size={28} />
        <p className="text-sm text-royal/60">
          This room opens 10 minutes before your appointment, at{' '}
          {new Date(appointment.scheduledAt).toLocaleString(undefined, {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
          })}
          .
        </p>
        <Link to={user?.role === 'DOCTOR' ? '/doctor' : '/patient'} className="btn-secondary !px-4 !py-2 text-xs">
          Back to dashboard
        </Link>
      </div>
    );
  }

  // The doctor attached their own Zoom / Meet / Teams link: send both people there instead of the
  // built-in room. Only https links are ever rendered as clickable.
  if (appointment.meetingUrl && appointment.meetingUrl.toLowerCase().startsWith('https://')) {
    const host = new URL(appointment.meetingUrl).hostname;
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
        <Video className="text-magenta" size={32} />
        <p className="text-lg font-bold text-royal">Your video call is ready</p>
        <p className="text-sm text-royal/60">
          {user?.role === 'DOCTOR' ? 'Your patient will join' : `${doctorName(appointment.doctor.fullName)} will meet you`} on{' '}
          <span className="font-semibold text-royal">{host}</span>.
        </p>
        <a
          href={appointment.meetingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary inline-flex items-center !px-6 !py-2.5"
        >
          <ExternalLink size={15} className="mr-2" /> Open video call
        </a>
        <Link to={user?.role === 'DOCTOR' ? '/doctor' : '/patient'} className="text-xs font-semibold text-royal/50 hover:text-royal">
          Back to dashboard
        </Link>
      </div>
    );
  }

  const otherParty = user?.role === 'DOCTOR' ? appointment.patient.fullName : doctorName(appointment.doctor.fullName);

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <div className="flex items-center justify-between">
        <Link
          to={user?.role === 'DOCTOR' ? '/doctor' : '/patient'}
          className="flex items-center gap-1.5 text-xs font-semibold text-royal/50 transition-colors hover:text-royal"
        >
          <ArrowLeft size={14} /> Back to dashboard
        </Link>
        <p className="text-sm text-royal/60">
          With <span className="font-semibold text-royal">{otherParty}</span>
        </p>
      </div>

      <p className="mt-3 text-xs text-royal/50">
        Video not loading?{' '}
        <a
          href={`https://meet.jit.si/${appointment.jitsiRoomName}`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-magenta hover:opacity-70"
        >
          Open the call in a new tab
        </a>
        . Your doctor and you must both use the same option.
      </p>

      <div className="glass-card mt-4 overflow-hidden">
        <JitsiMeeting
          domain="meet.jit.si"
          roomName={appointment.jitsiRoomName}
          userInfo={{ displayName: user?.fullName ?? 'DocuCare user', email: user?.email ?? '' }}
          configOverwrite={{
            prejoinPageEnabled: false,
            disableModeratorIndicator: true,
          }}
          interfaceConfigOverwrite={{
            TOOLBAR_BUTTONS: [
              'microphone', 'camera', 'hangup', 'chat', 'fullscreen', 'settings', 'raisehand',
            ],
          }}
          getIFrameRef={(iframeRef) => {
            iframeRef.style.height = '640px';
            iframeRef.style.width = '100%';
          }}
        />
      </div>
    </div>
  );
}
