import { useState } from 'react';
import { CalendarCheck } from 'lucide-react';
import { TriageChat } from '../components/TriageChat';
import { DoctorBooking } from '../components/DoctorBooking';
import { AppointmentsList } from '../components/AppointmentsList';
import { AppointmentResponse } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { doctorName } from '../lib/format';
import { UrgentCallBanner } from '../components/UrgentCallBanner';

const TABS = ['AI Triage & Booking', 'My Appointments'] as const;

export function PatientDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState<(typeof TABS)[number]>('AI Triage & Booking');
  const [recommendation, setRecommendation] = useState<{ specialty: string; triageSessionId: string } | null>(null);
  const [confirmed, setConfirmed] = useState<AppointmentResponse | null>(null);

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-2xl font-bold text-royal">Welcome back, {user?.fullName.split(' ')[0]}</h1>

      <UrgentCallBanner />

      <div className="mt-6 flex gap-2 border-b border-royal/10">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`-mb-px border-b-2 px-1 pb-3 text-sm font-semibold transition-colors duration-300 ease-docucare ${
              tab === t ? 'border-magenta text-magenta' : 'border-transparent text-royal/50 hover:text-royal'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === 'AI Triage & Booking' && (
          <div className="space-y-5">
            {confirmed ? (
              <div className="interactive-card p-6 text-center">
                <CalendarCheck className="mx-auto text-magenta" size={28} />
                <p className="mt-3 text-sm font-semibold text-royal">Appointment requested</p>
                <p className="mt-1 text-sm text-royal/60">
                  {doctorName(confirmed.doctor?.fullName)} will review your AI summary and confirm shortly. You'll see it
                  under My Appointments.
                </p>
                <button
                  onClick={() => setTab('My Appointments')}
                  className="btn-secondary mt-4 !px-4 !py-2 text-xs"
                >
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

        {tab === 'My Appointments' && <AppointmentsList />}
      </div>
    </div>
  );
}
