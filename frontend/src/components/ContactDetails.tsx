import { MapPin, Mail, Phone } from 'lucide-react';
import { ContactDetailsContent } from '../types/cms';

export function ContactDetails({ content }: { content: ContactDetailsContent }) {
  const rows = [
    { icon: MapPin, title: 'Visit us', label: content.address, href: undefined },
    { icon: Mail, title: 'Email us', label: content.email, href: `mailto:${content.email}` },
    { icon: Phone, title: 'Call us', label: content.phone, href: `tel:${content.phone}` },
  ];

  return (
    <div className="space-y-4">
      {rows.map((row) => {
        const body = (
          <>
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-soft text-magenta transition-all duration-300 ease-docucare group-hover:bg-brand-gradient group-hover:text-white">
              <row.icon size={20} />
            </span>
            <span className="min-w-0">
              <span className="block text-xs font-semibold uppercase tracking-wider text-royal/40">{row.title}</span>
              <span className="mt-0.5 block break-words text-sm font-medium text-royal">{row.label}</span>
            </span>
          </>
        );

        return row.href ? (
          <a key={row.title} href={row.href} className="interactive-card group flex items-center gap-4 p-5">
            {body}
          </a>
        ) : (
          <div key={row.title} className="glass-card group flex items-center gap-4 p-5">
            {body}
          </div>
        );
      })}
    </div>
  );
}
