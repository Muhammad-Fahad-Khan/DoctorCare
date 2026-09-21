import { Link } from 'react-router-dom';
import { ArrowRight, Bot, CalendarCheck, CheckCircle2, Sparkles, Star, Video } from 'lucide-react';
import { HeroContent } from '../types/cms';

const TRUST = ['Verified doctors', 'Private & secure', 'No waiting rooms'];

/** Decorative product preview: shows the real flow (AI chat -> match -> booked) without any fake data claims. */
function HeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-md lg:max-w-none">
      <div className="absolute -inset-6 -z-10 rounded-[3rem] bg-brand-soft blur-2xl" aria-hidden />

      {/* Main chat card */}
      <div className="glass-card animate-float-slow overflow-hidden !rounded-3xl shadow-lift">
        <div className="flex items-center gap-3 border-b border-royal/5 bg-white px-5 py-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-gradient text-white">
            <Bot size={18} />
          </span>
          <div>
            <p className="text-sm font-bold text-royal">AI Symptom Checker</p>
            <p className="flex items-center gap-1.5 text-xs text-royal/50">
              <span className="h-1.5 w-1.5 rounded-full bg-mint" /> Online now
            </p>
          </div>
        </div>

        <div className="space-y-3 bg-surface/60 p-5">
          <div className="ml-auto max-w-[80%] rounded-2xl rounded-tr-sm bg-brand-gradient px-4 py-2.5 text-sm text-white">
            I've had a headache and a mild fever since yesterday.
          </div>
          <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-white px-4 py-2.5 text-sm text-royal/80 shadow-sm">
            Thanks for sharing. Any sore throat or body aches? I'll match you with the right doctor.
          </div>
          <div className="flex items-center gap-2 rounded-2xl border border-magenta/20 bg-white p-3">
            <Sparkles size={16} className="shrink-0 text-magenta" />
            <p className="text-xs font-semibold text-royal">
              Recommended: <span className="text-magenta">General Physician</span>
            </p>
          </div>
        </div>
      </div>

      {/* Floating: appointment confirmed */}
      <div className="glass-card absolute -bottom-12 -left-2 hidden animate-float items-center gap-3 !rounded-2xl p-3.5 pr-5 shadow-lift sm:flex lg:-left-10">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-mint/15 text-mint">
          <CalendarCheck size={18} />
        </span>
        <div>
          <p className="text-xs font-bold text-royal">Appointment confirmed</p>
          <p className="text-[11px] text-royal/50">Today · Video consultation</p>
        </div>
      </div>

      {/* Floating: video chip */}
      <div className="glass-card absolute -right-2 -top-5 hidden animate-float-slow items-center gap-2 !rounded-full py-2 pl-2.5 pr-4 shadow-lift sm:flex lg:-right-6">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-magenta/10 text-magenta">
          <Video size={14} />
        </span>
        <span className="text-xs font-semibold text-royal">HD video call</span>
        <span className="flex items-center gap-0.5 text-magenta">
          <Star size={11} fill="currentColor" strokeWidth={0} />
          <span className="text-[11px] font-bold">4.9</span>
        </span>
      </div>
    </div>
  );
}

export function Hero({ content }: { content: HeroContent }) {
  return (
    <section className="relative overflow-hidden px-6 pb-20 pt-14 sm:pt-20">
      {/* ambient background */}
      <div className="bg-dots pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" aria-hidden />
      <div
        className="pointer-events-none absolute -left-24 top-0 h-[420px] w-[420px] animate-blob rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(241,188,228,0.7), transparent 70%)' }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-24 top-40 h-[360px] w-[360px] animate-blob rounded-full blur-3xl [animation-delay:-6s]"
        style={{ background: 'radial-gradient(circle, rgba(184,122,182,0.4), transparent 70%)' }}
        aria-hidden
      />

      <div className="relative mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1.1fr_1fr]">
        <div className="text-center lg:text-left">
          <span className="eyebrow animate-fade-up">
            <Sparkles size={13} /> AI-guided care · Video consultations
          </span>

          <h1 className="animate-fade-up text-balance mt-5 text-4xl font-extrabold leading-[1.08] tracking-tight text-royal [animation-delay:80ms] sm:text-5xl lg:text-6xl">
            <span className="text-gradient">{content.heading}</span>
          </h1>

          <p className="animate-fade-up text-balance mx-auto mt-6 max-w-xl text-base leading-relaxed text-royal/70 [animation-delay:160ms] sm:text-lg lg:mx-0">
            {content.subheading}
          </p>

          <div className="animate-fade-up mt-9 flex flex-col items-center gap-3 [animation-delay:240ms] sm:flex-row sm:justify-center lg:justify-start">
            <Link to="/patient" className="btn-primary w-full !px-7 !py-3.5 sm:w-auto">
              {content.ctaLabel} <ArrowRight size={16} />
            </Link>
            <a href="#chatbot" className="btn-secondary w-full !px-7 !py-3.5 sm:w-auto">
              Try the symptom checker
            </a>
          </div>

          <ul className="animate-fade-up mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-royal/65 [animation-delay:320ms] lg:justify-start">
            {TRUST.map((t) => (
              <li key={t} className="flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-mint" /> {t}
              </li>
            ))}
          </ul>
        </div>

        <div className="animate-fade-up [animation-delay:200ms]">
          <HeroVisual />
        </div>
      </div>
    </section>
  );
}
