import { useEffect, useState } from 'react';
import {
  ExternalLink,
  HelpCircle,
  Home,
  Info,
  LucideIcon,
  Mail,
  MessageSquareQuote,
  RefreshCw,
} from 'lucide-react';
import { api } from '../lib/api';
import {
  ChatbotIntroContent,
  CmsPageResponse,
  ContactDetailsContent,
  FaqContent,
  FeaturesContent,
  HeroContent,
  ImagesContent,
  StatsContent,
  StoryContent,
  TestimonialsContent,
} from '../types/cms';
import {
  ChatbotIntroEditor,
  ContactDetailsEditor,
  FaqEditor,
  FeaturesEditor,
  HeroEditor,
  StatsEditor,
  StoryEditor,
  TestimonialsEditor,
} from './cms/sections';
import { ImagesEditor } from './cms/ImagesEditor';

type Slug = 'home' | 'about' | 'contact';

// Defaults used if a section doesn't exist in the DB yet (first-time setup).
const DEFAULTS: Record<string, unknown> = {
  hero: { heading: '', subheading: '', ctaLabel: 'Book Now' },
  chatbotIntro: { promptText: '' },
  features: { items: [] },
  testimonials: { items: [] },
  faq: { items: [] },
  story: { heading: '', body: '' },
  stats: { items: [] },
  contactDetails: { address: '', email: '', phone: '' },
};

const TABS = [
  { id: 'home', label: 'Home', icon: Home, slug: 'home', viewPath: '/', blurb: 'Hero banner, AI checker banner, feature cards and background images.' },
  { id: 'faqs', label: 'FAQs', icon: HelpCircle, slug: 'home', viewPath: '/', blurb: 'Questions and answers shown on the home page.' },
  { id: 'testimonials', label: 'Testimonials', icon: MessageSquareQuote, slug: 'home', viewPath: '/', blurb: 'Patient quotes shown on the home page.' },
  { id: 'about', label: 'About', icon: Info, slug: 'about', viewPath: '/about', blurb: 'Our story, statistics and header image.' },
  { id: 'contact', label: 'Contact', icon: Mail, slug: 'contact', viewPath: '/contact', blurb: 'Address, email, phone and header image.' },
] as const satisfies readonly { id: string; label: string; icon: LucideIcon; slug: Slug; viewPath: string; blurb: string }[];

type TabId = (typeof TABS)[number]['id'];
type PageState = CmsPageResponse | 'error' | undefined;

export function CmsEditor() {
  const [tab, setTab] = useState<TabId>('home');
  const [pages, setPages] = useState<Record<Slug, PageState>>({ home: undefined, about: undefined, contact: undefined });

  function load(slug: Slug) {
    setPages((p) => ({ ...p, [slug]: undefined }));
    api
      .getPage(slug)
      .then((page) => setPages((p) => ({ ...p, [slug]: page })))
      .catch(() => setPages((p) => ({ ...p, [slug]: 'error' })));
  }

  // All pages load once and stay mounted, so unsaved edits survive switching between tabs.
  useEffect(() => {
    (['home', 'about', 'contact'] as const).forEach(load);
  }, []);

  const active = TABS.find((t) => t.id === tab)!;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-royal/55">
          Pick what you want to change. Nothing goes live until you press <strong className="text-royal">Save changes</strong>.
        </p>
        <a
          href={active.viewPath}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-magenta transition-opacity hover:opacity-70"
        >
          View live page <ExternalLink size={13} />
        </a>
      </div>

      <div role="tablist" className="mt-4 flex gap-2 overflow-x-auto pb-1">
        {TABS.map((t) => {
          const isActive = tab === t.id;
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => setTab(t.id)}
              className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-300 ease-docucare ${
                isActive
                  ? 'bg-royal text-white shadow-md'
                  : 'border border-royal/10 bg-white text-royal/60 hover:border-magenta/30 hover:text-royal'
              }`}
            >
              <t.icon size={15} />
              {t.label}
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-xs text-royal/45">{active.blurb}</p>

      <div className="mt-5">
        {TABS.map((t) => (
          <div key={t.id} hidden={tab !== t.id} className="space-y-5">
            <TabBody tabId={t.id} state={pages[t.slug]} onRetry={() => load(t.slug)} />
          </div>
        ))}
      </div>
    </div>
  );
}

function TabBody({ tabId, state, onRetry }: { tabId: TabId; state: PageState; onRetry: () => void }) {
  if (state === 'error') {
    return (
      <div className="glass-card flex flex-col items-center gap-3 p-10 text-center">
        <p className="text-sm text-royal/60">Could not load this page's content. Is the API running?</p>
        <button onClick={onRetry} className="btn-secondary !px-4 !py-2 text-xs">
          <RefreshCw size={13} /> Try again
        </button>
      </div>
    );
  }
  if (!state) {
    return (
      <div className="space-y-4" aria-busy>
        {[0, 1].map((i) => (
          <div key={i} className="glass-card h-40 animate-pulse bg-royal/[0.03]" />
        ))}
      </div>
    );
  }

  const contentFor = <T,>(key: string) => (state.sections.find((s) => s.key === key)?.content ?? DEFAULTS[key]) as T;
  const optionalContent = <T,>(key: string) => state.sections.find((s) => s.key === key)?.content as T | undefined;
  const orderFor = (key: string, fallback: number) => state.sections.find((s) => s.key === key)?.order ?? fallback;

  switch (tabId) {
    case 'home':
      return (
        <>
          <HeroEditor initial={contentFor<HeroContent>('hero')} order={orderFor('hero', 0)} />
          <ChatbotIntroEditor initial={contentFor<ChatbotIntroContent>('chatbotIntro')} order={orderFor('chatbotIntro', 1)} />
          <FeaturesEditor initial={contentFor<FeaturesContent>('features')} order={orderFor('features', 2)} />
          <ImagesEditor
            pageSlug="home"
            initial={optionalContent<ImagesContent>('images')}
            description="Pictures behind the top banner and the closing call-to-action on the home page."
            slots={[
              { key: 'heroBackground', label: 'Top banner background', hint: 'Behind the main heading at the top of the home page.' },
              { key: 'ctaBackground', label: 'Bottom banner background', hint: 'Shown faintly behind the purple "Ready to feel better?" banner.' },
            ]}
          />
        </>
      );
    case 'faqs':
      return <FaqEditor initial={contentFor<FaqContent>('faq')} order={orderFor('faq', 4)} />;
    case 'testimonials':
      return <TestimonialsEditor initial={contentFor<TestimonialsContent>('testimonials')} order={orderFor('testimonials', 3)} />;
    case 'about':
      return (
        <>
          <StoryEditor initial={contentFor<StoryContent>('story')} order={orderFor('story', 0)} />
          <StatsEditor initial={contentFor<StatsContent>('stats')} order={orderFor('stats', 1)} />
          <ImagesEditor
            pageSlug="about"
            initial={optionalContent<ImagesContent>('images')}
            description="The picture behind the heading at the top of the About page."
            slots={[{ key: 'headerBackground', label: 'Page header background', hint: 'Behind "Our story" at the top of the page.' }]}
          />
        </>
      );
    case 'contact':
      return (
        <>
          <ContactDetailsEditor initial={contentFor<ContactDetailsContent>('contactDetails')} order={orderFor('contactDetails', 0)} />
          <ImagesEditor
            pageSlug="contact"
            initial={optionalContent<ImagesContent>('images')}
            description="The picture behind the heading at the top of the Contact page."
            slots={[{ key: 'headerBackground', label: 'Page header background', hint: 'Behind "Get in touch" at the top of the page.' }]}
          />
        </>
      );
  }
}
