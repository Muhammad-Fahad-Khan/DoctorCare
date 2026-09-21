import { FormEvent, useState } from 'react';
import { KeyRound, CheckCircle2 } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

export function Account() {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (newPassword !== confirmPassword) {
      setError("New passwords don't match.");
      return;
    }
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters.');
      return;
    }

    setSubmitting(true);
    try {
      await api.changePassword({ currentPassword, newPassword });
      setSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not change your password.');
    } finally {
      setSubmitting(false);
    }
  }

  const inputCls =
    'mt-1.5 w-full rounded-xl border border-royal/10 bg-white/70 px-3.5 py-2.5 text-sm outline-none transition-all duration-300 ease-docucare focus:border-magenta/50 focus:ring-2 focus:ring-magenta/20';

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <h1 className="text-2xl font-bold text-royal">Account</h1>
      <p className="mt-1 text-sm text-royal/50">
        {user?.fullName} · {user?.email}
      </p>

      <form onSubmit={onSubmit} className="interactive-card mt-8 space-y-4 p-6">
        <div className="flex items-center gap-2 text-sm font-semibold text-royal">
          <KeyRound size={15} className="text-magenta" /> Change password
        </div>

        <label className="block text-sm font-medium text-royal/80">
          Current password
          <input type="password" required value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className={inputCls} />
        </label>
        <label className="block text-sm font-medium text-royal/80">
          New password
          <input type="password" required minLength={8} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={inputCls} />
        </label>
        <label className="block text-sm font-medium text-royal/80">
          Confirm new password
          <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={inputCls} />
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {success && (
          <p className="flex items-center gap-1.5 text-sm text-wisteria">
            <CheckCircle2 size={14} /> Password updated.
          </p>
        )}

        <button type="submit" disabled={submitting} className="btn-primary w-full disabled:opacity-60">
          {submitting ? 'Updating…' : 'Update password'}
        </button>
      </form>
    </div>
  );
}
