import { useState } from 'react';
import { CalendarClock, ClipboardList } from 'lucide-react';
import { AppointmentQueue } from '../components/AppointmentQueue';
import { AvailabilityManager } from '../components/AvailabilityManager';
import { useAuth } from '../context/AuthContext';
import { DashboardShell, DashboardTab } from '../components/DashboardShell';

type Tab = 'queue' | 'availability';

const TABS: DashboardTab<Tab>[] = [
  { id: 'queue', label: 'Appointment Queue', icon: ClipboardList },
  { id: 'availability', label: 'My Availability', icon: CalendarClock },
];

export function DoctorDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>('queue');

  return (
    <DashboardShell
      eyebrow="Doctor dashboard"
      title={`Dr. ${user?.fullName.split(' ').slice(-1)[0]}`}
      subtitle="Review patient requests with their AI summary, and set the times you're available to consult."
      tabs={TABS}
      active={tab}
      onChange={setTab}
    >
      {tab === 'queue' && <AppointmentQueue />}
      {tab === 'availability' && <AvailabilityManager />}
    </DashboardShell>
  );
}
