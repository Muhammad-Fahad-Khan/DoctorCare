import { FormEvent, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState<'PATIENT' | 'DOCTOR'>('PATIENT');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const result = await register({
        email,
        password,
        fullName,
        role,
        ...(role === 'DOCTOR' ? { specialty, licenseNumber } : {}),
      });
      if (result.pendingApproval) {
        setPendingMessage(result.message ?? 'Registration received — awaiting admin approval.');
      } else {
        navigate('/patient');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not register.');
    } finally {
      setSubmitting(false);
    }
  }

  if (pendingMessage) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-6">
        <div className="glass-card max-w-sm p-8 text-center">
          <h1 className="text-lg font-bold text-royal">Almost there</h1>
          <p className="mt-2 text-sm text-royal/70">{pendingMessage}</p>
          <Link to="/" className="btn-secondary mt-6 inline-flex">Back to home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-6 py-10">
      <form onSubmit={onSubmit} className="glass-card w-full max-w-sm p-8">
        <h1 className="text-xl font-bold text-royal">Create your account</h1>

        <div className="mt-5 flex gap-2 rounded-full bg-royal/5 p-1">
          {(['PATIENT', 'DOCTOR'] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`flex-1 rounded-full py-2 text-xs font-semibold transition-all duration-300 ease-docucare ${
                role === r ? 'bg-magenta text-white shadow-sm' : 'text-royal/60'
              }`}
            >
              {r === 'PATIENT' ? 'Patient' : 'Doctor'}
            </button>
          ))}
        </div>

        <label className="mt-5 block text-sm font-medium text-royal/80">
          Full name
          <input
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-royal/10 bg-white/70 px-3.5 py-2.5 text-sm outline-none transition-all duration-300 ease-docucare focus:border-magenta/50 focus:ring-2 focus:ring-magenta/20"
          />
        </label>

        <label className="mt-4 block text-sm font-medium text-royal/80">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-royal/10 bg-white/70 px-3.5 py-2.5 text-sm outline-none transition-all duration-300 ease-docucare focus:border-magenta/50 focus:ring-2 focus:ring-magenta/20"
          />
        </label>

        <label className="mt-4 block text-sm font-medium text-royal/80">
          Password
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-royal/10 bg-white/70 px-3.5 py-2.5 text-sm outline-none transition-all duration-300 ease-docucare focus:border-magenta/50 focus:ring-2 focus:ring-magenta/20"
          />
        </label>

        {role === 'DOCTOR' && (
          <>
            <label className="mt-4 block text-sm font-medium text-royal/80">
              Specialty
              <input
                required
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                placeholder="e.g. General Physician"
                className="mt-1.5 w-full rounded-xl border border-royal/10 bg-white/70 px-3.5 py-2.5 text-sm outline-none transition-all duration-300 ease-docucare focus:border-magenta/50 focus:ring-2 focus:ring-magenta/20"
              />
            </label>
            <label className="mt-4 block text-sm font-medium text-royal/80">
              Medical license number
              <input
                required
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-royal/10 bg-white/70 px-3.5 py-2.5 text-sm outline-none transition-all duration-300 ease-docucare focus:border-magenta/50 focus:ring-2 focus:ring-magenta/20"
              />
            </label>
          </>
        )}

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <button type="submit" disabled={submitting} className="btn-primary mt-6 w-full disabled:opacity-60">
          {submitting ? 'Creating account…' : 'Create account'}
        </button>

        <p className="mt-4 text-center text-sm text-royal/60">
          Already have an account? <Link to="/login" className="font-semibold text-magenta">Log in</Link>
        </p>
      </form>
    </div>
  );
}
