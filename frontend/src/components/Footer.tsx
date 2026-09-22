import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { Logo } from './Navbar';
import { useAuth } from '../context/AuthContext';

export function Footer() {
  const { user } = useAuth();

  return (
    <footer className="mt-10 bg-dark-gradient text-white">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Logo light />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/65">
              Describe how you feel, get matched with a verified doctor, and meet them by video. All in one place.
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-orchid">Explore</p>
            <ul className="mt-4 space-y-2.5 text-sm text-white/70">
              <li><Link to="/" className="transition-colors hover:text-white">Home</Link></li>
              <li><Link to="/about" className="transition-colors hover:text-white">About us</Link></li>
              <li><Link to="/contact" className="transition-colors hover:text-white">Contact</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-orchid">Get started</p>
            <ul className="mt-4 space-y-2.5 text-sm text-white/70">
              {user ? (
                <li><Link to="/account" className="transition-colors hover:text-white">Account settings</Link></li>
              ) : (
                <>
                  <li><Link to="/register" className="transition-colors hover:text-white">Create an account</Link></li>
                  <li><Link to="/login" className="transition-colors hover:text-white">Log in</Link></li>
                </>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} DocuCare. Open-source telemedicine.</p>
          <p className="flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-orchid" />
            Not for emergencies - if it's urgent, call your local emergency number.
          </p>
        </div>
      </div>
    </footer>
  );
}
