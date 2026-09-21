import { useState } from 'react';
import { BrainCircuit, FileText, Inbox, UserCheck } from 'lucide-react';
import { DoctorApprovalPanel } from '../components/DoctorApprovalPanel';
import { CmsEditor } from '../components/CmsEditor';
import { GroqSettingsPanel } from '../components/GroqSettingsPanel';
import { ContactInquiriesPanel } from '../components/ContactInquiriesPanel';
import { DashboardShell, DashboardTab } from '../components/DashboardShell';

type Tab = 'approvals' | 'content' | 'ai' | 'inquiries';

const TABS: DashboardTab<Tab>[] = [
  { id: 'approvals', label: 'Doctor Approvals', icon: UserCheck },
  { id: 'content', label: 'Website Content', icon: FileText },
  { id: 'ai', label: 'AI Settings', icon: BrainCircuit },
  { id: 'inquiries', label: 'Inquiries', icon: Inbox },
];

export function AdminDashboard() {
  const [tab, setTab] = useState<Tab>('approvals');

  return (
    <DashboardShell
      eyebrow="Admin"
      title="Control center"
      subtitle="Approve doctors, edit the public website, configure the AI assistant and answer visitor inquiries."
      tabs={TABS}
      active={tab}
      onChange={setTab}
    >
      {tab === 'approvals' && <DoctorApprovalPanel />}
      {tab === 'content' && <CmsEditor />}
      {tab === 'ai' && <GroqSettingsPanel />}
      {tab === 'inquiries' && <ContactInquiriesPanel />}
    </DashboardShell>
  );
}
