import { MapPin, Mail, Phone } from 'lucide-react';
import { ContactDetailsContent } from '../types/cms';

export function ContactDetails({ content }: { content: ContactDetailsContent }) {
  const rows = [
    { icon: MapPin, label: content.address, href: undefined },
    { icon: Mail, label: content.email, href: `mailto:${content.email}` },
    { icon: Phone, label: content.phone, href: `tel:${content.phone}` },
  ];

  return (
    <div className="glass-card space-y-4 p-6">
      {rows.map((row) => (
        <div key={row.label} className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-magenta/10 text-magenta">
            <row.icon size={16} />
          </span>
          {row.href ? (
            <a href={row.href} className="text-sm text-royal/80 transition-colors hover:text-magenta">
              {row.label}
            </a>
          ) : (
            <span className="text-sm text-royal/80">{row.label}</span>
          )}
        </div>
      ))}
    </div>
  );
}
