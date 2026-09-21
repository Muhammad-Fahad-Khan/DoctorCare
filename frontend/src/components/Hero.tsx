import { HeroContent } from '../types/cms';

export function Hero({ content }: { content: HeroContent }) {
  return (
    <section className="relative overflow-hidden px-6 pt-16 pb-24">
      {/* ambient glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[420px] -translate-x-1/2 rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(241,188,228,0.55), transparent 70%)' }}
        aria-hidden
      />

      <div className="relative mx-auto max-w-3xl text-center">
        <h1
          className="text-balance text-4xl font-extrabold leading-tight sm:text-5xl md:text-6xl"
          style={{
            backgroundImage: 'linear-gradient(90deg, #9E35A7, #4E175D)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          {content.heading}
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-balance text-base text-royal/70 sm:text-lg">
          {content.subheading}
        </p>

        <div className="mt-9 flex items-center justify-center gap-4">
          <a href="/patient" className="btn-primary">
            {content.ctaLabel}
          </a>
          <a href="#chatbot" className="btn-secondary">
            Try the symptom checker
          </a>
        </div>
      </div>
    </section>
  );
}
