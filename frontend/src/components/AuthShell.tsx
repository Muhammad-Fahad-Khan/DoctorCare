import { ReactNode } from 'react';
import { CheckCircle2, HeartPulse } from 'lucide-react';

const POINTS = [
  'AI symptom checker matches you to the right specialist',
  'Verified doctors and same-day video appointments',
  'Your health information stays private and secure',
];

/** Split-screen layout shared by Login and Register: brand panel on the left, form on the right. */
export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto grid min-h-[calc(100vh-7rem)] max-w-6xl items-stretch gap-0 px-4 py-6 sm:px-6 lg:grid-cols-2 lg:py-10">
      {/* Brand panel */}
      <aside className="relative hidden overflow-hidden rounded-l-[2rem] bg-brand-gradient p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="bg-dots pointer-events-none absolute inset-0 opacity-25 [filter:invert(1)]" aria-hidden />
        <div
          className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.3), transparent 70%)' }}
          aria-hidden
        />

        <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25">
          <HeartPulse size={24} />
        </div>

        <div className="relative">
          <h2 className="text-balance text-3xl font-extrabold leading-tight tracking-tight">
            Healthcare that fits into your day.
          </h2>
          <ul className="mt-8 space-y-4">
            {POINTS.map((p) => (
              <li key={p} className="flex items-start gap-3 text-sm leading-relaxed text-white/85">
                <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-orchid" />
                {p}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-white/60">DocuCare · Open-source telemedicine</p>
      </aside>

      {/* Form panel */}
      <div className="flex items-center justify-center rounded-[2rem] border border-royal/[0.06] bg-white p-6 shadow-soft sm:p-10 lg:rounded-l-none lg:rounded-r-[2rem]">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-extrabold tracking-tight text-royal sm:text-3xl">{title}</h1>
          <p className="mt-2 text-sm text-royal/60">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
