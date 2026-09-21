import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

export interface DashboardTab<T extends string> {
  id: T;
  label: string;
  icon: LucideIcon;
}

/**
 * Shared frame for the patient / doctor / admin dashboards: a friendly header card,
 * one row of pill tabs (icon + label), then the active panel. Keeps navigation identical
 * across roles so people always know where to look.
 */
export function DashboardShell<T extends string>({
  eyebrow,
  title,
  subtitle,
  tabs,
  active,
  onChange,
  banner,
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  tabs: DashboardTab<T>[];
  active: T;
  onChange: (id: T) => void;
  banner?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
      <header className="relative overflow-hidden rounded-3xl bg-dark-gradient p-7 text-white shadow-lift sm:p-9">
        <div
          className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full blur-2xl"
          style={{ background: 'radial-gradient(circle, rgba(184,122,182,0.55), transparent 70%)' }}
          aria-hidden
        />
        <div className="bg-dots pointer-events-none absolute inset-0 opacity-20 [filter:invert(1)]" aria-hidden />
        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-wider text-orchid">{eyebrow}</p>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">{title}</h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/70">{subtitle}</p>
        </div>
      </header>

      {banner}

      <div
        role="tablist"
        className="mt-6 flex gap-1.5 overflow-x-auto rounded-2xl border border-royal/[0.06] bg-white p-1.5 shadow-soft"
      >
        {tabs.map((t) => {
          const isActive = active === t.id;
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(t.id)}
              className={`flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-300 ease-docucare ${
                isActive
                  ? 'bg-brand-gradient text-white shadow-md shadow-magenta/25'
                  : 'text-royal/60 hover:bg-royal/5 hover:text-royal'
              }`}
            >
              <t.icon size={16} />
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="mt-6 animate-fade-up" key={active}>
        {children}
      </div>
    </div>
  );
}
