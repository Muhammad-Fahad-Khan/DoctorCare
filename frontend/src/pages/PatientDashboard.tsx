import { useState } from 'react';
import { CalendarCheck, CalendarDays, Sparkles } from 'lucide-react';
import { TriageChat } from '../components/TriageChat';
import { DoctorBooking } from '../components/DoctorBooking';
import { AppointmentsList } from '../components/AppointmentsList';
import { AppointmentResponse } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { doctorName } from '../lib/format';
import { UrgentCallBanner } from '../components/UrgentCallBanner';
import { DashboardShell, DashboardTab } from '../components/DashboardShell';

type Tab = 'triage' | 'appointments';

const TABS: DashboardTab<Tab>[] = [
  { id: 'triage', label: 'AI Triage & Booking', icon: Sparkles },
  { id: 'appointments', label: 'My Appointments', icon: CalendarDays },
];

export function PatientDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>('triage');
  const [recommendation, setRecommendation] = useState<{ specialty: string; triageSessionId: string } | null>(null);
  const [confirmed, setConfirmed] = useState<AppointmentResponse | null>(null);

  return (
    <DashboardShell
      eyebrow="Patient dashboard"
      title={`Welcome back, ${user?.fullName.split(' ')[0]}`}
      subtitle="Tell our AI how you're feeling, book a matching doctor, and manage your appointments in one place."
      tabs={TABS}
      active={tab}
      onChange={setTab}
      banner={<UrgentCallBanner />}
    >
      {tab === 'triage' && (
        <div className="space-y-5">
          {confirmed ? (
            <div className="glass-card p-8 text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-mint/15 text-mint">
                <CalendarCheck size={28} />
              </span>
              <p className="mt-4 text-lg font-bold text-royal">Appointment requested</p>
              <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-royal/60">
                {doctorName(confirmed.doctor?.fullName)} will review your AI summary and confirm shortly. You'll see it
                under My Appointments.
              </p>
              <button onClick={() => setTab('appointments')} className="btn-primary mt-6">
                View My Appointments
              </button>
            </div>
          ) : (
            <>
              <TriageChat
                onRecommendation={(specialty, triageSessionId) => setRecommendation({ specialty, triageSessionId })}
              />
              {recommendation && (
                <DoctorBooking
                  specialty={recommendation.specialty}
                  triageSessionId={recommendation.triageSessionId}
                  onDone={setConfirmed}
                />
              )}
            </>
          )}
        </div>
      )}

      {tab === 'appointments' && <AppointmentsList />}
    </DashboardShell>
  );
}
