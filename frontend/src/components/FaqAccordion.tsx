import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { FaqContent } from '../types/cms';

export function FaqAccordion({ content }: { content: FaqContent }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-2xl">
        <h2 className="text-center text-2xl font-bold text-royal sm:text-3xl">
          Questions people ask before their first visit
        </h2>

        <div className="mt-8 space-y-3">
          {content.items.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <div key={item.question} className="glass-card overflow-hidden">
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors duration-300 ease-docucare hover:bg-orchid/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-magenta"
                  aria-expanded={isOpen}
                >
                  <span className="text-sm font-semibold text-royal">{item.question}</span>
                  <ChevronDown
                    size={18}
                    className={`shrink-0 text-wisteria transition-transform duration-300 ease-docucare ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-4 text-sm leading-relaxed text-royal/70">{item.answer}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
