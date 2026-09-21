import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { CmsPageResponse, ContactDetailsContent } from '../types/cms';
import { ContactDetails } from '../components/ContactDetails';
import { ContactForm } from '../components/ContactForm';

export function Contact() {
  const [page, setPage] = useState<CmsPageResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getPage('contact').then(setPage).catch(() => setError('Could not load this page.'));
  }, []);

  if (error) {
    return <div className="flex min-h-[50vh] items-center justify-center px-6 text-center text-royal/60">{error}</div>;
  }
  if (!page) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-magenta border-t-transparent" />
      </div>
    );
  }

  const details = page.sections.find((s) => s.key === 'contactDetails')?.content as ContactDetailsContent | undefined;

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-center text-3xl font-extrabold text-royal sm:text-4xl">Get in touch</h1>
      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
        {details && <ContactDetails content={details} />}
        <ContactForm />
      </div>
    </div>
  );
}
