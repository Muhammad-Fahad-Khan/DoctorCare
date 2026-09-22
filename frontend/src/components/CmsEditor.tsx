import { useEffect, useState } from 'react';
import {
  Bot,
  ExternalLink,
  FileText,
  HelpCircle,
  Image as ImageIcon,
  LayoutTemplate,
  LucideIcon,
  Mail,
  MessageSquareQuote,
  RefreshCw,
  Sparkles,
  TrendingUp,
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
type PageState = CmsPageResponse | 'error' | undefined;

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

// One tab per section — nothing is bundled, so it's always obvious what a tab changes.
const TABS = [
  { id: 'hero', label: 'Hero Banner', icon: LayoutTemplate, slug: 'home', viewPath: '/', blurb: 'The main heading and button at the top of the home page.' },
  { id: 'chatbot', label: 'AI Checker Banner', icon: Bot, slug: 'home', viewPath: '/', blurb: 'The dark banner inviting visitors to try the AI symptom checker.' },
  { id: 'features', label: 'Feature Cards', icon: Sparkles, slug: 'home', viewPath: '/', blurb: 'The "Care built around when you need it" cards.' },
  { id: 'faqs', label: 'FAQs', icon: HelpCircle, slug: 'home', viewPath: '/', blurb: 'Questions and answers shown on the home page.' },
  { id: 'testimonials', label: 'Testimonials', icon: MessageSquareQuote, slug: 'home', viewPath: '/', blurb: 'Patient quotes shown on the home page.' },
  { id: 'backgrounds', label: 'Backgrounds', icon: ImageIcon, slug: 'home', viewPath: '/', blurb: 'Pictures behind the Home, About and Contact page headers.' },
  { id: 'story', label: 'Our Story', icon: FileText, slug: 'about', viewPath: '/about', blurb: 'The heading and paragraph at the top of the About page.' },
  { id: 'stats', label: 'Statistics', icon: TrendingUp, slug: 'about', viewPath: '/about', blurb: 'The big animated numbers on the About page.' },
  { id: 'contact', label: 'Contact Details', icon: Mail, slug: 'contact', viewPath: '/contact', blurb: 'Address, email and phone shown on the Contact page.' },
] as const satisfies readonly { id: string; label: string; icon: LucideIcon; slug: Slug; viewPath: string; blurb: string }[];

type TabId = (typeof TABS)[number]['id'];

function imagesOf(state: PageState): ImagesContent | undefined {
  if (!state || state === 'error') return undefined;
  return state.sections.find((s) => s.key === 'images')?.content as ImagesContent | undefined;
}

export function CmsEditor() {
  const [tab, setTab] = useState<TabId>('hero');
  const [pages, setPages] = useState<Record<Slug, PageState>>({ home: undefined, about: undefined, contact: undefined });

  function load(slug: Slug) {
    setPages((p) => ({ ...p, [slug]: undefined }));
    api
      .getPage(slug)
      .then((page) => setPages((p) => ({ ...p, [slug]: page })))
      .catch(() => setPages((p) => ({ ...p, [slug]: 'error' })));
  }

  // All three pages load once and stay mounted, so unsaved edits survive switching between tabs.
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

      <div role="tablist" className="mt-4 flex flex-wrap gap-2">
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
            <TabBody tabId={t.id} pages={pages} onRetry={load} />
          </div>
        ))}
      </div>
    </div>
  );
}

function LoadError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="glass-card flex flex-col items-center gap-3 p-10 text-center">
      <p className="text-sm text-royal/60">Could not load this page's content. Is the API running?</p>
      <button onClick={onRetry} className="btn-secondary !px-4 !py-2 text-xs">
        <RefreshCw size={13} /> Try again
      </button>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4" aria-busy>
      {[0, 1].map((i) => (
        <div key={i} className="glass-card h-40 animate-pulse bg-royal/[0.03]" />
      ))}
    </div>
  );
}

function TabBody({
  tabId,
  pages,
  onRetry,
}: {
  tabId: TabId;
  pages: Record<Slug, PageState>;
  onRetry: (slug: Slug) => void;
}) {
  // The Backgrounds tab is the one section that spans all three pages at once.
  if (tabId === 'backgrounds') {
    const slugs: Slug[] = ['home', 'about', 'contact'];
    const erroredSlug = slugs.find((s) => pages[s] === 'error');
    if (erroredSlug) return <LoadError onRetry={() => onRetry(erroredSlug)} />;
    if (slugs.some((s) => !pages[s])) return <LoadingSkeleton />;

    return (
      <>
        <ImagesEditor
          pageSlug="home"
          title="Home page images"
          initial={imagesOf(pages.home)}
          description="Pictures behind the top banner and the closing call-to-action on the home page."
          slots={[
            { key: 'heroBackground', label: 'Top banner background', hint: 'Behind the main heading at the top of the home page.' },
            { key: 'ctaBackground', label: 'Bottom banner background', hint: 'Shown faintly behind the purple "Ready to feel better?" banner.' },
          ]}
        />
        <ImagesEditor
          pageSlug="about"
          title="About page image"
          initial={imagesOf(pages.about)}
          description="The picture behind the heading at the top of the About page."
          slots={[{ key: 'headerBackground', label: 'Page header background', hint: 'Behind "Our story" at the top of the page.' }]}
        />
        <ImagesEditor
          pageSlug="contact"
          title="Contact page image"
          initial={imagesOf(pages.contact)}
          description="The picture behind the heading at the top of the Contact page."
          slots={[{ key: 'headerBackground', label: 'Page header background', hint: 'Behind "Get in touch" at the top of the page.' }]}
        />
      </>
    );
  }

  const slug = TABS.find((t) => t.id === tabId)!.slug;
  const state = pages[slug];

  if (state === 'error') return <LoadError onRetry={() => onRetry(slug)} />;
  if (!state) return <LoadingSkeleton />;

  const contentFor = <T,>(key: string) => (state.sections.find((s) => s.key === key)?.content ?? DEFAULTS[key]) as T;
  const orderFor = (key: string, fallback: number) => state.sections.find((s) => s.key === key)?.order ?? fallback;

  switch (tabId) {
    case 'hero':
      return <HeroEditor initial={contentFor<HeroContent>('hero')} order={orderFor('hero', 0)} />;
    case 'chatbot':
      return <ChatbotIntroEditor initial={contentFor<ChatbotIntroContent>('chatbotIntro')} order={orderFor('chatbotIntro', 1)} />;
    case 'features':
      return <FeaturesEditor initial={contentFor<FeaturesContent>('features')} order={orderFor('features', 2)} />;
    case 'faqs':
      return <FaqEditor initial={contentFor<FaqContent>('faq')} order={orderFor('faq', 4)} />;
    case 'testimonials':
      return <TestimonialsEditor initial={contentFor<TestimonialsContent>('testimonials')} order={orderFor('testimonials', 3)} />;
    case 'story':
      return <StoryEditor initial={contentFor<StoryContent>('story')} order={orderFor('story', 0)} />;
    case 'stats':
      return <StatsEditor initial={contentFor<StatsContent>('stats')} order={orderFor('stats', 1)} />;
    case 'contact':
      return <ContactDetailsEditor initial={contentFor<ContactDetailsContent>('contactDetails')} order={orderFor('contactDetails', 0)} />;
  }
}
