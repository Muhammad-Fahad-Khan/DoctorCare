import { FormEvent, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AuthShell } from '../components/AuthShell';

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const user = await login(email, password);
      navigate(user.role === 'DOCTOR' ? '/doctor' : user.role === 'ADMIN' ? '/admin' : '/patient');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not log in.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell title="Welcome back" subtitle="Log in to see your appointments and continue where you left off.">
      <form onSubmit={onSubmit}>
        <label className="block text-sm font-medium text-royal/80">
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
              autoComplete="current-password"
              placeholder="Your password"
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

        {error && (
          <p role="alert" className="mt-4 rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-600">
            {error}
          </p>
        )}

        <button type="submit" disabled={submitting} className="btn-primary mt-6 w-full !py-3.5 disabled:opacity-60">
          {submitting ? 'Logging in…' : 'Log in'}
        </button>

        <p className="mt-6 text-center text-sm text-royal/60">
          New to DocuCare?{' '}
          <Link to="/register" className="font-semibold text-magenta hover:underline">
            Create an account
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
