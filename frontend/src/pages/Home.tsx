import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import {
  CmsPageResponse,
  HeroContent,
  ChatbotIntroContent,
  FeaturesContent,
  TestimonialsContent,
  FaqContent,
} from '../types/cms';
import { Hero } from '../components/Hero';
import { ChatbotEntry } from '../components/ChatbotEntry';
import { FeaturesGrid } from '../components/FeaturesGrid';
import { Testimonials } from '../components/Testimonials';
import { FaqAccordion } from '../components/FaqAccordion';
import { HowItWorks } from '../components/HowItWorks';
import { CtaBand } from '../components/CtaBand';

/**
 * Section-key -> renderer registry. This is the whole "dynamic CMS" contract:
 * the backend decides WHAT content and in what order; this map only decides
 * HOW each section key is drawn. Adding a new section type is one entry here
 * plus one component — nothing else on this page changes.
 */
function renderSection(section: CmsPageResponse['sections'][number]) {
  switch (section.key) {
    case 'hero':
      return <Hero key={section.key} content={section.content as HeroContent} />;
    case 'chatbotIntro':
      return <ChatbotEntry key={section.key} content={section.content as ChatbotIntroContent} />;
    case 'features':
      return <FeaturesGrid key={section.key} content={section.content as FeaturesContent} />;
    case 'testimonials':
      return <Testimonials key={section.key} content={section.content as TestimonialsContent} />;
    case 'faq':
      return <FaqAccordion key={section.key} content={section.content as FaqContent} />;
    default:
      return null;
  }
}

export function Home() {
  const [page, setPage] = useState<CmsPageResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getPage('home')
      .then(setPage)
      .catch(() => setError('Could not load page content.'));
  }, []);

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-6 text-center text-royal/60">
        {error} Make sure the API is running and the CMS has been seeded.
      </div>
    );
  }

  if (!page) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-magenta border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      {[...page.sections]
        .sort((a, b) => a.order - b.order)
        .flatMap((section) => {
          const node = renderSection(section);
          // "How it works" is static (not CMS-managed): it sits right after the features grid.
          return section.key === 'features' ? [node, <HowItWorks key="how-it-works" />] : [node];
        })}
      <CtaBand />
    </div>
  );
}
