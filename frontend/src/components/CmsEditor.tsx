import { useEffect, useState } from 'react';
import { Plus, Trash2, Save, Check } from 'lucide-react';
import { api } from '../lib/api';
import {
  CmsPageResponse,
  HeroContent,
  ChatbotIntroContent,
  FeaturesContent,
  TestimonialsContent,
  FaqContent,
  FeatureItem,
  TestimonialItem,
  FaqItem,
  StoryContent,
  StatsContent,
  StatItem,
  ContactDetailsContent,
} from '../types/cms';

const inputCls =
  'mt-1.5 w-full rounded-xl border border-royal/10 bg-white/70 px-3.5 py-2.5 text-sm outline-none transition-all duration-300 ease-docucare focus:border-magenta/50 focus:ring-2 focus:ring-magenta/20';

function SaveBar({ onSave, saving, saved }: { onSave: () => void; saving: boolean; saved: boolean }) {
  return (
    <button onClick={onSave} disabled={saving} className="btn-primary mt-4 !px-4 !py-2 text-xs disabled:opacity-50">
      {saved ? <Check size={13} className="mr-1.5 inline" /> : <Save size={13} className="mr-1.5 inline" />}
      {saving ? 'Saving…' : saved ? 'Saved' : 'Save section'}
    </button>
  );
}

function useSectionSave(pageSlug: string, sectionKey: string, order: number) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(content: object) {
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      await api.upsertCmsSection(pageSlug, { sectionKey, content: content as Record<string, unknown>, order });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save this section.');
    } finally {
      setSaving(false);
    }
  }

  return { save, saving, saved, error };
}

function HeroEditor({ initial, order }: { initial: HeroContent; order: number }) {
  const [content, setContent] = useState(initial);
  const { save, saving, saved, error } = useSectionSave('home', 'hero', order);

  return (
    <div className="interactive-card p-5">
      <p className="text-sm font-semibold text-royal">Hero</p>
      <label className="mt-3 block text-xs font-medium text-royal/60">
        Heading
        <input value={content.heading} onChange={(e) => setContent({ ...content, heading: e.target.value })} className={inputCls} />
      </label>
      <label className="mt-3 block text-xs font-medium text-royal/60">
        Subheading
        <textarea rows={2} value={content.subheading} onChange={(e) => setContent({ ...content, subheading: e.target.value })} className={inputCls} />
      </label>
      <label className="mt-3 block text-xs font-medium text-royal/60">
        CTA button label
        <input value={content.ctaLabel} onChange={(e) => setContent({ ...content, ctaLabel: e.target.value })} className={inputCls} />
      </label>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      <SaveBar onSave={() => save(content)} saving={saving} saved={saved} />
    </div>
  );
}

function ChatbotIntroEditor({ initial, order }: { initial: ChatbotIntroContent; order: number }) {
  const [content, setContent] = useState(initial);
  const { save, saving, saved, error } = useSectionSave('home', 'chatbotIntro', order);

  return (
    <div className="interactive-card p-5">
      <p className="text-sm font-semibold text-royal">AI Chatbot intro text</p>
      <label className="mt-3 block text-xs font-medium text-royal/60">
        Prompt shown to patients
        <textarea rows={2} value={content.promptText} onChange={(e) => setContent({ promptText: e.target.value })} className={inputCls} />
      </label>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      <SaveBar onSave={() => save(content)} saving={saving} saved={saved} />
    </div>
  );
}

function FeaturesEditor({ initial, order }: { initial: FeaturesContent; order: number }) {
  const [items, setItems] = useState<FeatureItem[]>(initial.items);
  const { save, saving, saved, error } = useSectionSave('home', 'features', order);

  function update(i: number, patch: Partial<FeatureItem>) {
    setItems(items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  }

  return (
    <div className="interactive-card p-5">
      <p className="text-sm font-semibold text-royal">Features grid</p>
      <div className="mt-3 space-y-3">
        {items.map((item, i) => (
          <div key={i} className="rounded-xl border border-royal/10 p-3">
            <div className="flex items-center gap-2">
              <input value={item.icon} onChange={(e) => update(i, { icon: e.target.value })} placeholder="Icon (lucide name)" className={`${inputCls} !mt-0 flex-1`} />
              <input value={item.title} onChange={(e) => update(i, { title: e.target.value })} placeholder="Title" className={`${inputCls} !mt-0 flex-[2]`} />
              <button onClick={() => setItems(items.filter((_, idx) => idx !== i))} className="text-royal/40 hover:text-red-600">
                <Trash2 size={15} />
              </button>
            </div>
            <textarea
              rows={2}
              value={item.description}
              onChange={(e) => update(i, { description: e.target.value })}
              placeholder="Description"
              className={`${inputCls} !mt-2`}
            />
          </div>
        ))}
      </div>
      <button
        onClick={() => setItems([...items, { icon: 'Star', title: '', description: '' }])}
        className="btn-secondary mt-3 !px-3 !py-1.5 text-xs"
      >
        <Plus size={13} className="mr-1 inline" /> Add feature
      </button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      <SaveBar onSave={() => save({ items })} saving={saving} saved={saved} />
    </div>
  );
}

function TestimonialsEditor({ initial, order }: { initial: TestimonialsContent; order: number }) {
  const [items, setItems] = useState<TestimonialItem[]>(initial.items);
  const { save, saving, saved, error } = useSectionSave('home', 'testimonials', order);

  function update(i: number, patch: Partial<TestimonialItem>) {
    setItems(items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  }

  return (
    <div className="interactive-card p-5">
      <p className="text-sm font-semibold text-royal">Testimonials</p>
      <div className="mt-3 space-y-3">
        {items.map((item, i) => (
          <div key={i} className="rounded-xl border border-royal/10 p-3">
            <div className="flex items-center gap-2">
              <input value={item.name} onChange={(e) => update(i, { name: e.target.value })} placeholder="Patient name" className={`${inputCls} !mt-0 flex-1`} />
              <input
                type="number"
                min={1}
                max={5}
                value={item.rating}
                onChange={(e) => update(i, { rating: Number(e.target.value) })}
                className={`${inputCls} !mt-0 w-16`}
              />
              <label className="flex items-center gap-1.5 text-xs text-royal/60">
                <input type="checkbox" checked={item.verified} onChange={(e) => update(i, { verified: e.target.checked })} />
                Verified
              </label>
              <button onClick={() => setItems(items.filter((_, idx) => idx !== i))} className="text-royal/40 hover:text-red-600">
                <Trash2 size={15} />
              </button>
            </div>
            <textarea rows={2} value={item.quote} onChange={(e) => update(i, { quote: e.target.value })} placeholder="Quote" className={`${inputCls} !mt-2`} />
          </div>
        ))}
      </div>
      <button
        onClick={() => setItems([...items, { name: '', quote: '', rating: 5, verified: false }])}
        className="btn-secondary mt-3 !px-3 !py-1.5 text-xs"
      >
        <Plus size={13} className="mr-1 inline" /> Add testimonial
      </button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      <SaveBar onSave={() => save({ items })} saving={saving} saved={saved} />
    </div>
  );
}

function FaqEditor({ initial, order }: { initial: FaqContent; order: number }) {
  const [items, setItems] = useState<FaqItem[]>(initial.items);
  const { save, saving, saved, error } = useSectionSave('home', 'faq', order);

  function update(i: number, patch: Partial<FaqItem>) {
    setItems(items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  }

  return (
    <div className="interactive-card p-5">
      <p className="text-sm font-semibold text-royal">FAQ</p>
      <div className="mt-3 space-y-3">
        {items.map((item, i) => (
          <div key={i} className="rounded-xl border border-royal/10 p-3">
            <div className="flex items-center gap-2">
              <input value={item.question} onChange={(e) => update(i, { question: e.target.value })} placeholder="Question" className={`${inputCls} !mt-0 flex-1`} />
              <button onClick={() => setItems(items.filter((_, idx) => idx !== i))} className="text-royal/40 hover:text-red-600">
                <Trash2 size={15} />
              </button>
            </div>
            <textarea rows={2} value={item.answer} onChange={(e) => update(i, { answer: e.target.value })} placeholder="Answer" className={`${inputCls} !mt-2`} />
          </div>
        ))}
      </div>
      <button
        onClick={() => setItems([...items, { question: '', answer: '' }])}
        className="btn-secondary mt-3 !px-3 !py-1.5 text-xs"
      >
        <Plus size={13} className="mr-1 inline" /> Add FAQ item
      </button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      <SaveBar onSave={() => save({ items })} saving={saving} saved={saved} />
    </div>
  );
}

function StoryEditor({ initial, order }: { initial: StoryContent; order: number }) {
  const [content, setContent] = useState(initial);
  const { save, saving, saved, error } = useSectionSave('about', 'story', order);

  return (
    <div className="interactive-card p-5">
      <p className="text-sm font-semibold text-royal">Our Story</p>
      <label className="mt-3 block text-xs font-medium text-royal/60">
        Heading
        <input value={content.heading} onChange={(e) => setContent({ ...content, heading: e.target.value })} className={inputCls} />
      </label>
      <label className="mt-3 block text-xs font-medium text-royal/60">
        Body
        <textarea rows={4} value={content.body} onChange={(e) => setContent({ ...content, body: e.target.value })} className={inputCls} />
      </label>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      <SaveBar onSave={() => save(content)} saving={saving} saved={saved} />
    </div>
  );
}

function StatsEditor({ initial, order }: { initial: StatsContent; order: number }) {
  const [items, setItems] = useState<StatItem[]>(initial.items);
  const { save, saving, saved, error } = useSectionSave('about', 'stats', order);

  function update(i: number, patch: Partial<StatItem>) {
    setItems(items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  }

  return (
    <div className="interactive-card p-5">
      <p className="text-sm font-semibold text-royal">Statistics</p>
      <div className="mt-3 space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <input value={item.value} onChange={(e) => update(i, { value: e.target.value })} placeholder="Value (e.g. 1,000+)" className={`${inputCls} !mt-0 w-32`} />
            <input value={item.label} onChange={(e) => update(i, { label: e.target.value })} placeholder="Label" className={`${inputCls} !mt-0 flex-1`} />
            <button onClick={() => setItems(items.filter((_, idx) => idx !== i))} className="text-royal/40 hover:text-red-600">
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>
      <button onClick={() => setItems([...items, { label: '', value: '' }])} className="btn-secondary mt-3 !px-3 !py-1.5 text-xs">
        <Plus size={13} className="mr-1 inline" /> Add stat
      </button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      <SaveBar onSave={() => save({ items })} saving={saving} saved={saved} />
    </div>
  );
}

function ContactDetailsEditor({ initial, order }: { initial: ContactDetailsContent; order: number }) {
  const [content, setContent] = useState(initial);
  const { save, saving, saved, error } = useSectionSave('contact', 'contactDetails', order);

  return (
    <div className="interactive-card p-5">
      <p className="text-sm font-semibold text-royal">Contact details</p>
      <label className="mt-3 block text-xs font-medium text-royal/60">
        Address
        <input value={content.address} onChange={(e) => setContent({ ...content, address: e.target.value })} className={inputCls} />
      </label>
      <label className="mt-3 block text-xs font-medium text-royal/60">
        Email
        <input value={content.email} onChange={(e) => setContent({ ...content, email: e.target.value })} className={inputCls} />
      </label>
      <label className="mt-3 block text-xs font-medium text-royal/60">
        Phone
        <input value={content.phone} onChange={(e) => setContent({ ...content, phone: e.target.value })} className={inputCls} />
      </label>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      <SaveBar onSave={() => save(content)} saving={saving} saved={saved} />
    </div>
  );
}

// Defaults used if a section doesn't exist in the DB yet (first-time setup).
const DEFAULTS: Record<string, Record<string, unknown>> = {
  hero: { heading: '', subheading: '', ctaLabel: 'Book Now' },
  chatbotIntro: { promptText: '' },
  features: { items: [] },
  testimonials: { items: [] },
  faq: { items: [] },
  story: { heading: '', body: '' },
  stats: { items: [] },
  contactDetails: { address: '', email: '', phone: '' },
};

const PAGE_TABS = ['Home', 'About', 'Contact'] as const;
const SLUG_FOR: Record<(typeof PAGE_TABS)[number], string> = { Home: 'home', About: 'about', Contact: 'contact' };

export function CmsEditor() {
  const [tab, setTab] = useState<(typeof PAGE_TABS)[number]>('Home');
  const [page, setPage] = useState<CmsPageResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPage(null);
    setError(null);
    api.getPage(SLUG_FOR[tab]).then(setPage).catch(() => setError(`Could not load ${tab} page content.`));
  }, [tab]);

  return (
    <div>
      <div className="flex gap-2">
        {PAGE_TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-300 ease-docucare ${
              tab === t ? 'bg-magenta text-white' : 'bg-royal/5 text-royal/60 hover:bg-royal/10'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-5">
        {error && <p className="text-sm text-red-600">{error}</p>}
        {!error && !page && <p className="text-sm text-royal/50">Loading…</p>}
        {page && <CmsEditorForm key={tab} page={page} tab={tab} />}
      </div>
    </div>
  );
}

function CmsEditorForm({ page, tab }: { page: CmsPageResponse; tab: (typeof PAGE_TABS)[number] }) {
  function contentFor(key: string) {
    return page.sections.find((s) => s.key === key)?.content ?? DEFAULTS[key];
  }
  function orderFor(key: string, fallback: number) {
    return page.sections.find((s) => s.key === key)?.order ?? fallback;
  }

  return (
    <div className="space-y-5">
      <p className="text-sm text-royal/50">
        Editing the {tab} page. Changes go live the moment you save each section.
      </p>

      {tab === 'Home' && (
        <>
          <HeroEditor initial={contentFor('hero') as HeroContent} order={orderFor('hero', 0)} />
          <ChatbotIntroEditor initial={contentFor('chatbotIntro') as ChatbotIntroContent} order={orderFor('chatbotIntro', 1)} />
          <FeaturesEditor initial={contentFor('features') as FeaturesContent} order={orderFor('features', 2)} />
          <TestimonialsEditor initial={contentFor('testimonials') as TestimonialsContent} order={orderFor('testimonials', 3)} />
          <FaqEditor initial={contentFor('faq') as FaqContent} order={orderFor('faq', 4)} />
        </>
      )}

      {tab === 'About' && (
        <>
          <StoryEditor initial={contentFor('story') as StoryContent} order={orderFor('story', 0)} />
          <StatsEditor initial={contentFor('stats') as StatsContent} order={orderFor('stats', 1)} />
        </>
      )}

      {tab === 'Contact' && (
        <ContactDetailsEditor initial={contentFor('contactDetails') as ContactDetailsContent} order={orderFor('contactDetails', 0)} />
      )}
    </div>
  );
}
