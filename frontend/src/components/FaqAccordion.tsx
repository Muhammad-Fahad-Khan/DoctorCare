import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { FaqContent } from '../types/cms';

export function FaqAccordion({ content }: { content: FaqContent }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  if (content.items.length === 0) return null;

  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <span className="eyebrow">FAQ</span>
          <h2 className="section-title mt-4">Questions people ask before their first visit</h2>
        </div>

        <div className="mt-10 space-y-3">
          {content.items.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={item.question}
                className={`glass-card overflow-hidden transition-all duration-300 ease-docucare ${
                  isOpen ? 'border-magenta/25 shadow-lift' : ''
                }`}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors duration-300 ease-docucare hover:bg-orchid/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-magenta"
                  aria-expanded={isOpen}
                >
                  <span className="text-base font-semibold text-royal">{item.question}</span>
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all duration-300 ease-docucare ${
                      isOpen ? 'rotate-180 bg-brand-gradient text-white' : 'bg-royal/5 text-wisteria'
                    }`}
                  >
                    <ChevronDown size={16} />
                  </span>
                </button>
                {/* grid-rows trick animates height without measuring the content */}
                <div
                  className={`grid transition-all duration-300 ease-docucare ${
                    isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="px-6 pb-5 text-sm leading-relaxed text-royal/70">{item.answer}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
