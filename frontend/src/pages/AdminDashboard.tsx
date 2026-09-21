import { useState } from 'react';
import { DoctorApprovalPanel } from '../components/DoctorApprovalPanel';
import { CmsEditor } from '../components/CmsEditor';
import { GroqSettingsPanel } from '../components/GroqSettingsPanel';
import { ContactInquiriesPanel } from '../components/ContactInquiriesPanel';

const TABS = ['Doctor Approvals', 'Website Content', 'AI Settings', 'Inquiries'] as const;

export function AdminDashboard() {
  const [tab, setTab] = useState<(typeof TABS)[number]>('Doctor Approvals');

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-2xl font-bold text-royal">Admin</h1>

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
        {tab === 'Doctor Approvals' && <DoctorApprovalPanel />}
        {tab === 'Website Content' && <CmsEditor />}
        {tab === 'AI Settings' && <GroqSettingsPanel />}
        {tab === 'Inquiries' && <ContactInquiriesPanel />}
      </div>
    </div>
  );
}
