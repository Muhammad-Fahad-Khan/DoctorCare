import { FormEvent, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Clock, Eye, EyeOff, Stethoscope, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AuthShell } from '../components/AuthShell';

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState<'PATIENT' | 'DOCTOR'>('PATIENT');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
        <div className="glass-card max-w-md p-10 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-soft text-magenta">
            <Clock size={26} />
          </span>
          <h1 className="mt-5 text-2xl font-extrabold text-royal">Almost there</h1>
          <p className="mt-3 text-sm leading-relaxed text-royal/70">{pendingMessage}</p>
          <Link to="/" className="btn-secondary mt-8">
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <AuthShell title="Create your account" subtitle="It takes less than a minute. No credit card needed.">
      <form onSubmit={onSubmit}>
        <div className="grid grid-cols-2 gap-2 rounded-2xl bg-royal/5 p-1" role="radiogroup" aria-label="I am a">
          {(['PATIENT', 'DOCTOR'] as const).map((r) => (
            <button
              key={r}
              type="button"
              role="radio"
              aria-checked={role === r}
              onClick={() => setRole(r)}
              className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all duration-300 ease-docucare ${
                role === r ? 'bg-white text-magenta shadow-sm' : 'text-royal/55 hover:text-royal'
              }`}
            >
              {r === 'PATIENT' ? <User size={15} /> : <Stethoscope size={15} />}
              {r === 'PATIENT' ? 'Patient' : 'Doctor'}
            </button>
          ))}
        </div>

        <label className="mt-5 block text-sm font-medium text-royal/80">
          Full name
          <input
            required
            autoComplete="name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="input-field mt-1.5"
          />
        </label>

        <label className="mt-4 block text-sm font-medium text-royal/80">
          Email
          <input
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field mt-1.5"
          />
        </label>

        <label className="mt-4 block text-sm font-medium text-royal/80">
          Password
          <div className="relative mt-1.5">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              minLength={8}
              autoComplete="new-password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field !pr-11"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-royal/40 transition-colors hover:text-royal"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </label>

        {role === 'DOCTOR' && (
          <div className="mt-4 animate-fade-up space-y-4 rounded-2xl border border-magenta/15 bg-magenta/[0.04] p-4">
            <p className="text-xs text-royal/60">
              Doctor accounts are reviewed by an admin before you can take appointments.
            </p>
            <label className="block text-sm font-medium text-royal/80">
              Specialty
              <input
                required
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                placeholder="e.g. General Physician"
                className="input-field mt-1.5"
              />
            </label>
            <label className="block text-sm font-medium text-royal/80">
              Medical license number
              <input
                required
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
                className="input-field mt-1.5"
              />
            </label>
          </div>
        )}

        {error && (
          <p role="alert" className="mt-4 rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-600">
            {error}
          </p>
        )}

        <button type="submit" disabled={submitting} className="btn-primary mt-6 w-full !py-3.5 disabled:opacity-60">
          {submitting ? 'Creating account…' : 'Create account'}
        </button>

        <p className="mt-6 text-center text-sm text-royal/60">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-magenta hover:underline">
            Log in
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
