import * as Icons from 'lucide-react';
import { LucideIcon, HelpCircle } from 'lucide-react';
import { FeaturesContent } from '../types/cms';

function resolveIcon(name: string): LucideIcon {
  const icon = (Icons as unknown as Record<string, LucideIcon>)[name];
  return icon ?? HelpCircle;
}

export function FeaturesGrid({ content }: { content: FeaturesContent }) {
  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center text-2xl font-bold text-royal sm:text-3xl">
          Care built around when you need it
        </h2>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {content.items.map((item) => {
            const Icon = resolveIcon(item.icon);
            return (
              <div key={item.title} className="interactive-card p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-wisteria/15 text-wisteria">
                  <Icon size={20} />
                </div>
                <h3 className="mt-4 text-sm font-semibold text-royal">{item.title}</h3>
                <p className="mt-1.5 text-sm text-royal/65">{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
