import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, HeartPulse, LayoutDashboard, LogOut, Menu, Settings, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const links = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

const DASHBOARD_PATH = { PATIENT: '/patient', DOCTOR: '/doctor', ADMIN: '/admin' } as const;

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-md shadow-magenta/30">
        <HeartPulse size={19} />
      </span>
      <span className={`text-lg font-extrabold tracking-tight ${light ? 'text-white' : 'text-royal'}`}>
        Docu<span className={light ? 'text-orchid' : 'text-magenta'}>Care</span>
      </span>
    </span>
  );
}

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menus whenever the page changes.
  useEffect(() => {
    setMobileOpen(false);
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Click outside the account menu closes it.
  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [menuOpen]);

  function handleLogout() {
    logout();
    navigate('/');
  }

  const firstName = user?.fullName.split(' ')[0] ?? '';
  const initial = firstName.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-50 w-full px-4 pt-3 sm:px-6">
      <nav
        className={`mx-auto max-w-6xl rounded-2xl border bg-white/80 px-4 py-2.5 backdrop-blur-xl transition-all duration-300 ease-docucare sm:px-5 ${
          scrolled ? 'border-royal/10 shadow-lift' : 'border-royal/[0.06] shadow-soft'
        }`}
      >
        <div className="flex items-center justify-between">
          <Link to="/" aria-label="DocuCare home">
            <Logo />
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  `rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ease-docucare ${
                    isActive ? 'bg-magenta/10 text-magenta' : 'text-royal/70 hover:bg-royal/5 hover:text-royal'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          <div className="hidden items-center gap-2 md:flex">
            {user ? (
              <>
                <Link to={DASHBOARD_PATH[user.role]} className="btn-primary !px-4 !py-2 text-xs">
                  <LayoutDashboard size={14} /> Dashboard
                </Link>

                <div ref={menuRef} className="relative">
                  <button
                    onClick={() => setMenuOpen((v) => !v)}
                    aria-haspopup="menu"
                    aria-expanded={menuOpen}
                    className="flex items-center gap-2 rounded-full border border-royal/10 bg-white py-1 pl-1 pr-2.5 transition-all duration-300 ease-docucare hover:border-magenta/40"
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-gradient text-xs font-bold text-white">
                      {initial}
                    </span>
                    <span className="text-xs font-semibold text-royal">{firstName}</span>
                    <ChevronDown
                      size={14}
                      className={`text-royal/50 transition-transform duration-300 ${menuOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {menuOpen && (
                    <div
                      role="menu"
                      className="absolute right-0 mt-2 w-56 origin-top-right animate-fade-up rounded-2xl border border-royal/10 bg-white p-1.5 shadow-lift"
                    >
                      <div className="border-b border-royal/5 px-3 py-2.5">
                        <p className="truncate text-sm font-semibold text-royal">{user.fullName}</p>
                        <p className="truncate text-xs text-royal/50">{user.email}</p>
                      </div>
                      <Link
                        to="/account"
                        role="menuitem"
                        className="mt-1 flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-royal/80 transition-colors hover:bg-orchid/20"
                      >
                        <Settings size={15} className="text-wisteria" /> Account settings
                      </Link>
                      <button
                        role="menuitem"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm text-royal/80 transition-colors hover:bg-red-50 hover:text-red-600"
                      >
                        <LogOut size={15} /> Log out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="rounded-full px-4 py-2 text-sm font-semibold text-royal/80 transition-colors hover:text-magenta">
                  Log in
                </Link>
                <Link to="/register" className="btn-primary !px-5 !py-2.5 text-sm">
                  Book Now
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-royal transition-colors hover:bg-royal/5 md:hidden"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {mobileOpen && (
          <div className="mt-3 animate-fade-up space-y-1 border-t border-royal/5 pt-3 md:hidden">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  `block rounded-xl px-4 py-3 text-sm font-semibold ${
                    isActive ? 'bg-magenta/10 text-magenta' : 'text-royal/80 hover:bg-royal/5'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}

            <div className="grid gap-2 pt-2">
              {user ? (
                <>
                  <Link to={DASHBOARD_PATH[user.role]} className="btn-primary text-sm">
                    <LayoutDashboard size={15} /> My dashboard
                  </Link>
                  <Link to="/account" className="btn-secondary text-sm">
                    <Settings size={15} /> Account settings
                  </Link>
                  <button onClick={handleLogout} className="btn-secondary text-sm">
                    <LogOut size={15} /> Log out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/register" className="btn-primary text-sm">
                    Book Now
                  </Link>
                  <Link to="/login" className="btn-secondary text-sm">
                    Log in
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
