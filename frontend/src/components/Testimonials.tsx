import { Star, BadgeCheck, Quote } from 'lucide-react';
import { TestimonialsContent } from '../types/cms';

export function Testimonials({ content }: { content: TestimonialsContent }) {
  if (content.items.length === 0) return null;

  return (
    <section className="bg-brand-soft/60 px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <span className="eyebrow">Testimonials</span>
          <h2 className="section-title mt-4">What patients are saying</h2>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2">
          {content.items.map((t) => (
            <figure key={t.name} className="interactive-card relative flex flex-col p-7">
              <Quote size={36} className="absolute right-6 top-6 text-orchid" fill="currentColor" strokeWidth={0} />
              <div className="flex items-center gap-1 text-magenta">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} size={15} fill="currentColor" strokeWidth={0} />
                ))}
              </div>
              <blockquote className="mt-4 flex-1 text-base leading-relaxed text-royal/80">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-gradient text-sm font-bold text-white">
                  {t.name.charAt(0).toUpperCase()}
                </span>
                <span className="flex items-center gap-1.5 text-sm font-semibold text-royal">
                  {t.name}
                  {t.verified && <BadgeCheck size={16} className="text-mint" aria-label="Verified patient" />}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
