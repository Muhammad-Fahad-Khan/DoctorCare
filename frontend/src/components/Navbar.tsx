import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const links = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

const DASHBOARD_PATH = { PATIENT: '/patient', DOCTOR: '/doctor', ADMIN: '/admin' } as const;

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <nav className="glass-card flex w-full items-center justify-between px-5 py-3 shadow-sm">
          <Link to="/" className="text-lg font-extrabold tracking-tight text-royal">
            Docu<span className="text-magenta">Care</span>
          </Link>

          <div className="hidden items-center gap-6 md:flex">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors duration-300 ease-docucare ${
                    isActive ? 'text-magenta' : 'text-royal/70 hover:text-royal'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link
                  to="/account"
                  aria-label="Account settings"
                  className="flex h-8 w-8 items-center justify-center rounded-full text-royal/50 transition-colors hover:bg-royal/5 hover:text-royal"
                >
                  <Settings size={16} />
                </Link>
                <Link to={DASHBOARD_PATH[user.role]} className="btn-secondary !px-4 !py-2 text-xs">
                  {user.fullName.split(' ')[0]}'s dashboard
                </Link>
                <button
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  className="btn-primary !px-4 !py-2 text-xs"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-secondary !px-4 !py-2 text-xs">
                  Log in
                </Link>
                <Link to="/register" className="btn-primary !px-4 !py-2 text-xs">
                  Book Now
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
