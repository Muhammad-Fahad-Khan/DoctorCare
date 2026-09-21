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

  const inputCls = 'input-field mt-1.5';

  return (
    <div className="mx-auto max-w-md px-6 py-12 sm:py-16">
      <span className="eyebrow">Account</span>
      <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-royal">Your account</h1>
      <p className="mt-1 text-sm text-royal/50">
        {user?.fullName} · {user?.email}
      </p>

      <form onSubmit={onSubmit} className="glass-card mt-8 space-y-4 p-6 sm:p-8">
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

        {error && <p role="alert" className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-600">{error}</p>}
        {success && (
          <p className="flex items-center gap-1.5 rounded-xl bg-mint/10 px-3.5 py-2.5 text-sm text-mint">
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
