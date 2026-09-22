import * as Icons from 'lucide-react';
import { LucideIcon, HelpCircle } from 'lucide-react';
import { FeaturesContent } from '../types/cms';

function resolveIcon(name: string): LucideIcon {
  const icon = (Icons as unknown as Record<string, LucideIcon>)[name];
  return icon ?? HelpCircle;
}

export function FeaturesGrid({ content }: { content: FeaturesContent }) {
  const items = content.items.filter((i) => i.active !== false);
  if (items.length === 0) return null;

  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <span className="eyebrow">Why DocuCare</span>
          <h2 className="section-title mt-4">Care built around when you need it</h2>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => {
            const Icon = resolveIcon(item.icon);
            return (
              <div key={item.title} className="interactive-card group p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-soft text-magenta transition-all duration-300 ease-docucare group-hover:bg-brand-gradient group-hover:text-white group-hover:shadow-md group-hover:shadow-magenta/30">
                  <Icon size={22} />
                </div>
                <h3 className="mt-5 text-base font-bold text-royal">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-royal/65">{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
