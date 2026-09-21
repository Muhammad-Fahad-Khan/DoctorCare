import { Star, BadgeCheck } from 'lucide-react';
import { TestimonialsContent } from '../types/cms';

export function Testimonials({ content }: { content: TestimonialsContent }) {
  return (
    <section className="bg-royal/[0.03] px-6 py-16">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center text-2xl font-bold text-royal sm:text-3xl">
          What patients are saying
        </h2>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {content.items.map((t) => (
            <div key={t.name} className="interactive-card p-6">
              <div className="flex items-center gap-1 text-magenta">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} size={14} fill="currentColor" strokeWidth={0} />
                ))}
              </div>
              <p className="mt-3 text-sm leading-relaxed text-royal/80">&ldquo;{t.quote}&rdquo;</p>
              <div className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-royal">
                {t.name}
                {t.verified && <BadgeCheck size={15} className="text-wisteria" />}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
