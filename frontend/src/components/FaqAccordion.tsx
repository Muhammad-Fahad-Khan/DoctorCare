import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { FaqContent } from '../types/cms';
import { matches } from '../lib/search';
import { Highlight, NoResults, SearchBar } from './SearchBar';

export function FaqAccordion({ content }: { content: FaqContent }) {
  const items = content.items.filter((i) => i.active !== false);
  const [openQuestion, setOpenQuestion] = useState<string | null>(items[0]?.question ?? null);
  const [query, setQuery] = useState('');

  if (items.length === 0) return null;

  const searching = query.trim() !== '';
  const shown = items.filter((i) => !searching || matches(query, i.question, i.answer));

  return (
    <section id="faq" className="scroll-mt-24 px-6 py-20">
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <span className="eyebrow">FAQ</span>
          <h2 className="section-title mt-4">Questions people ask before their first visit</h2>
        </div>

        <SearchBar className="mx-auto mt-8 max-w-xl" value={query} onChange={setQuery} placeholder="Search the questions…" />
        {searching && shown.length === 0 && <NoResults query={query} onClear={() => setQuery('')} />}

        <div className="mt-6 space-y-3">
          {shown.map((item) => {
            // While searching, every matching answer is shown so nothing is hidden behind a click.
            const isOpen = searching || openQuestion === item.question;
            return (
              <div
                key={item.question}
                className={`glass-card overflow-hidden transition-all duration-300 ease-docucare ${
                  isOpen ? 'border-magenta/25 shadow-lift' : ''
                }`}
              >
                <button
                  onClick={() => setOpenQuestion(openQuestion === item.question ? null : item.question)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors duration-300 ease-docucare hover:bg-orchid/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-magenta"
                  aria-expanded={isOpen}
                >
                  <span className="text-base font-semibold text-royal">
                    <Highlight text={item.question} query={searching ? query : ''} />
                  </span>
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
                    <p className="px-6 pb-5 text-sm leading-relaxed text-royal/70">
                      <Highlight text={item.answer} query={searching ? query : ''} />
                    </p>
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
