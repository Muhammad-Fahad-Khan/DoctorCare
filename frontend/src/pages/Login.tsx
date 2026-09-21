import { FormEvent, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    <div className="flex min-h-[70vh] items-center justify-center px-6">
      <form onSubmit={onSubmit} className="glass-card w-full max-w-sm p-8">
        <h1 className="text-xl font-bold text-royal">Log in to DocuCare</h1>

        <label className="mt-6 block text-sm font-medium text-royal/80">
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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-royal/10 bg-white/70 px-3.5 py-2.5 text-sm outline-none transition-all duration-300 ease-docucare focus:border-magenta/50 focus:ring-2 focus:ring-magenta/20"
          />
        </label>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <button type="submit" disabled={submitting} className="btn-primary mt-6 w-full disabled:opacity-60">
          {submitting ? 'Logging in…' : 'Log in'}
        </button>

        <p className="mt-4 text-center text-sm text-royal/60">
          No account? <Link to="/register" className="font-semibold text-magenta">Sign up</Link>
        </p>
      </form>
    </div>
  );
}
