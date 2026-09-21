import { useState } from 'react';
import { AppointmentQueue } from '../components/AppointmentQueue';
import { AvailabilityManager } from '../components/AvailabilityManager';
import { useAuth } from '../context/AuthContext';

const TABS = ['Appointment Queue', 'My Availability'] as const;

export function DoctorDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState<(typeof TABS)[number]>('Appointment Queue');

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-2xl font-bold text-royal">Dr. {user?.fullName.split(' ').slice(-1)[0]}</h1>

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
        {tab === 'Appointment Queue' && <AppointmentQueue />}
        {tab === 'My Availability' && <AvailabilityManager />}
      </div>
    </div>
  );
}
