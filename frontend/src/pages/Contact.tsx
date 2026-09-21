import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { CmsPageResponse, ContactDetailsContent, ImagesContent } from '../types/cms';
import { BackgroundImage } from '../components/BackgroundImage';
import { pickImage } from '../lib/images';
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

  const images = page.sections.find((s) => s.key === 'images')?.content as ImagesContent | undefined;

  return (
    <div>
      <header className="relative overflow-hidden px-6 pb-4 pt-16 sm:pt-24">
        <BackgroundImage
          src={pickImage(images, 'headerBackground')}
          overlay="bg-gradient-to-b from-white/50 via-white/30 to-surface"
        />
        <div className="relative mx-auto max-w-5xl text-center">
          <span className="eyebrow">Contact</span>
          <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-royal sm:text-5xl">
            <span className="text-gradient">Get in touch</span>
          </h1>
          <p className="section-lead">Questions, feedback or partnership ideas — we'd love to hear from you.</p>
        </div>
      </header>
      <div className="mx-auto mt-8 grid max-w-5xl grid-cols-1 gap-6 px-6 pb-16 sm:pb-24 lg:grid-cols-[1fr_1.4fr]">
        {details && <ContactDetails content={details} />}
        <ContactForm />
      </div>
    </div>
  );
}
