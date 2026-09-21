import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const DASHBOARD_PATH = { PATIENT: '/patient', DOCTOR: '/doctor', ADMIN: '/admin' } as const;

export function CtaBand() {
  const { user } = useAuth();

  return (
    <section className="px-6 pb-10 pt-4">
      <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[2rem] bg-brand-gradient px-8 py-14 text-center text-white shadow-glow-magenta sm:px-14">
        <div className="bg-dots pointer-events-none absolute inset-0 opacity-30 [filter:invert(1)]" aria-hidden />
        <div
          className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.35), transparent 70%)' }}
          aria-hidden
        />

        <div className="relative">
          <h2 className="text-balance text-3xl font-extrabold tracking-tight sm:text-4xl">
            {user ? `Welcome back, ${user.fullName.split(' ')[0]}` : 'Ready to feel better?'}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-balance text-base text-white/80 sm:text-lg">
            {user
              ? 'Pick up where you left off — your appointments and AI summaries are waiting.'
              : 'Create a free account and talk to a verified doctor today.'}
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to={user ? DASHBOARD_PATH[user.role] : '/register'} className="btn-light !px-8 !py-3.5">
              {user ? 'Go to my dashboard' : 'Create free account'} <ArrowRight size={16} />
            </Link>
            {!user && (
              <Link
                to="/login"
                className="inline-flex items-center justify-center rounded-full border border-white/30 px-8 py-3.5 text-sm font-semibold text-white transition-all duration-300 ease-docucare hover:bg-white/10"
              >
                I already have an account
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
