import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Ban } from 'lucide-react';
import { api, DoctorProfileAdmin } from '../lib/api';

const TABS = ['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'] as const;

const STATUS_STYLES: Record<DoctorProfileAdmin['status'], string> = {
  PENDING: 'bg-orchid text-royal',
  APPROVED: 'bg-wisteria/15 text-wisteria',
  REJECTED: 'bg-red-50 text-red-600',
  SUSPENDED: 'bg-royal/10 text-royal/60',
};

export function DoctorApprovalPanel() {
  const [tab, setTab] = useState<(typeof TABS)[number]>('PENDING');
  const [doctors, setDoctors] = useState<DoctorProfileAdmin[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  function refresh() {
    api
      .listAdminDoctors(tab)
      .then(setDoctors)
      .catch(() => setError('Could not load doctors.'));
  }

  useEffect(() => {
    setDoctors(null);
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  async function setStatus(id: string, status: DoctorProfileAdmin['status']) {
    setBusyId(id);
    setError(null);
    try {
      await api.updateDoctorStatus(id, status);
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update this doctor.');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <div className="flex gap-2">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-300 ease-docucare ${
              tab === t ? 'bg-magenta text-white' : 'bg-royal/5 text-royal/60 hover:bg-royal/10'
            }`}
          >
            {t[0] + t.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      {doctors === null && <p className="mt-4 text-sm text-royal/50">Loading…</p>}
      {doctors?.length === 0 && <p className="mt-4 text-sm text-royal/50">No doctors in this state.</p>}

      <div className="mt-4 space-y-3">
        {doctors?.map((doc) => (
          <div key={doc.id} className="interactive-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-royal">{doc.user.fullName}</p>
                <p className="text-xs text-royal/50">{doc.user.email}</p>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[doc.status]}`}>
                {doc.status}
              </span>
            </div>

            <div className="mt-2 text-xs text-royal/60">
              <span className="font-medium text-royal/80">{doc.specialty}</span> · License #{doc.licenseNumber}
            </div>

            <div className="mt-3 flex gap-2">
              {doc.status !== 'APPROVED' && (
                <button
                  disabled={busyId === doc.id}
                  onClick={() => setStatus(doc.id, 'APPROVED')}
                  className="flex items-center gap-1.5 rounded-full bg-wisteria/15 px-3 py-1.5 text-xs font-semibold text-wisteria transition-all duration-300 ease-docucare hover:bg-wisteria/25 disabled:opacity-50"
                >
                  <CheckCircle2 size={13} /> Approve
                </button>
              )}
              {doc.status !== 'REJECTED' && (
                <button
                  disabled={busyId === doc.id}
                  onClick={() => setStatus(doc.id, 'REJECTED')}
                  className="flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition-all duration-300 ease-docucare hover:bg-red-100 disabled:opacity-50"
                >
                  <XCircle size={13} /> Reject
                </button>
              )}
              {doc.status === 'APPROVED' && (
                <button
                  disabled={busyId === doc.id}
                  onClick={() => setStatus(doc.id, 'SUSPENDED')}
                  className="flex items-center gap-1.5 rounded-full bg-royal/5 px-3 py-1.5 text-xs font-semibold text-royal/60 transition-all duration-300 ease-docucare hover:bg-royal/10 disabled:opacity-50"
                >
                  <Ban size={13} /> Suspend
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
