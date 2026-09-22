import { ReactNode } from 'react';
import * as Icons from 'lucide-react';
import {
  Activity,
  Award,
  BadgeCheck,
  Bot,
  CalendarCheck,
  Clock,
  FileText,
  Globe,
  HeartPulse,
  HelpCircle,
  LayoutTemplate,
  Lock,
  LucideIcon,
  Mail,
  MessageCircle,
  MessageSquareQuote,
  Phone,
  Pill,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Star,
  Stethoscope,
  TrendingUp,
  Users,
  Video,
  Zap,
} from 'lucide-react';
import {
  ChatbotIntroContent,
  ContactDetailsContent,
  FaqContent,
  FaqItem,
  FeatureItem,
  FeaturesContent,
  HeroContent,
  StatItem,
  StatsContent,
  StoryContent,
  TestimonialItem,
  TestimonialsContent,
} from '../../types/cms';
import { Hero } from '../Hero';
import { ChatbotEntry } from '../ChatbotEntry';
import { FeaturesGrid } from '../FeaturesGrid';
import { Testimonials } from '../Testimonials';
import { FaqAccordion } from '../FaqAccordion';
import { Story } from '../Story';
import { StatsCounters } from '../StatsCounters';
import { ContactDetails } from '../ContactDetails';
import { ItemListEditor } from './ListEditor';
import { Field, PreviewPanel, SaveBar, SectionCard, useSectionEditor } from './shared';

/* ------------------------------------------------------------------ */
/* Reusable pickers                                                    */
/* ------------------------------------------------------------------ */

// Curated so admins pick from a grid instead of guessing lucide icon names.
const ICON_CHOICES: { name: string; icon: LucideIcon }[] = [
  { name: 'Clock', icon: Clock },
  { name: 'Stethoscope', icon: Stethoscope },
  { name: 'Video', icon: Video },
  { name: 'Bot', icon: Bot },
  { name: 'ShieldCheck', icon: ShieldCheck },
  { name: 'HeartPulse', icon: HeartPulse },
  { name: 'CalendarCheck', icon: CalendarCheck },
  { name: 'MessageCircle', icon: MessageCircle },
  { name: 'Phone', icon: Phone },
  { name: 'Users', icon: Users },
  { name: 'Star', icon: Star },
  { name: 'Award', icon: Award },
  { name: 'Lock', icon: Lock },
  { name: 'Zap', icon: Zap },
  { name: 'Globe', icon: Globe },
  { name: 'Pill', icon: Pill },
  { name: 'Activity', icon: Activity },
  { name: 'Smartphone', icon: Smartphone },
  { name: 'Sparkles', icon: Sparkles },
  { name: 'BadgeCheck', icon: BadgeCheck },
];

function iconFor(name: string): LucideIcon {
  return (Icons as unknown as Record<string, LucideIcon>)[name] ?? HelpCircle;
}

function IconPicker({ value, onChange }: { value: string; onChange: (name: string) => void }) {
  // An icon saved earlier (e.g. by hand) that isn't in the curated list is still shown and stays selected.
  const choices = ICON_CHOICES.some((c) => c.name === value)
    ? ICON_CHOICES
    : [{ name: value, icon: iconFor(value) }, ...ICON_CHOICES];

  return (
    <div>
      <p className="text-xs font-semibold text-royal/70">Icon</p>
      <div className="mt-2 grid grid-cols-5 gap-2 sm:grid-cols-10">
        {choices.map(({ name, icon: Icon }) => (
          <button
            key={name}
            type="button"
            title={name}
            aria-label={name}
            aria-pressed={value === name}
            onClick={() => onChange(name)}
            className={`flex h-10 items-center justify-center rounded-xl border transition-all duration-300 ease-docucare ${
              value === name
                ? 'border-magenta bg-brand-gradient text-white shadow-md shadow-magenta/25'
                : 'border-royal/10 bg-white text-royal/60 hover:border-magenta/40 hover:bg-orchid/20'
            }`}
          >
            <Icon size={18} />
          </button>
        ))}
      </div>
    </div>
  );
}

function StarRating({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <div>
      <p className="text-xs font-semibold text-royal/70">Rating</p>
      <div className="mt-2 flex gap-1" role="radiogroup" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            aria-label={`${n} star${n === 1 ? '' : 's'}`}
            onClick={() => onChange(n)}
            className="rounded-md p-0.5 transition-transform duration-200 hover:scale-110"
          >
            <Star
              size={24}
              className={n <= value ? 'text-magenta' : 'text-royal/15'}
              fill="currentColor"
              strokeWidth={0}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  hint?: string;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-royal/10 px-4 py-3">
      <span>
        <span className="block text-sm font-semibold text-royal">{label}</span>
        {hint && <span className="block text-xs text-royal/50">{hint}</span>}
      </span>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
      <span
        aria-hidden
        className="relative h-6 w-11 shrink-0 rounded-full bg-royal/15 transition-colors duration-300 after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition-transform after:duration-300 peer-checked:bg-magenta peer-checked:after:translate-x-5 peer-focus-visible:ring-2 peer-focus-visible:ring-magenta peer-focus-visible:ring-offset-2"
      />
    </label>
  );
}

/* ------------------------------------------------------------------ */
/* One-off sections (a handful of text fields)                          */
/* ------------------------------------------------------------------ */

interface FieldSpec<T> {
  key: keyof T & string;
  label: string;
  kind?: 'text' | 'textarea';
  rows?: number;
  placeholder?: string;
  hint?: string;
  required?: boolean;
}

function ObjectEditor<T extends object>({
  pageSlug,
  sectionKey,
  order,
  icon,
  title,
  description,
  initial,
  fields,
  preview,
}: {
  pageSlug: string;
  sectionKey: string;
  order: number;
  icon: LucideIcon;
  title: string;
  description: string;
  initial: T;
  fields: FieldSpec<T>[];
  preview?: (draft: T) => ReactNode;
}) {
  const { draft, setDraft, dirty, saving, justSaved, error, save, discard } = useSectionEditor<T>({
    pageSlug,
    sectionKey,
    order,
    initial,
    toContent: (d) => d as unknown as Record<string, unknown>,
    validate: (d) => {
      const missing = fields.find((f) => f.required && !String((d as Record<string, unknown>)[f.key] ?? '').trim());
      return missing ? `“${missing.label}” can't be empty.` : null;
    },
  });

  return (
    <SectionCard icon={icon} title={title} description={description}>
      <div className="space-y-4">
        {fields.map((f) => {
          const value = String((draft as Record<string, unknown>)[f.key] ?? '');
          const onChange = (v: string) => setDraft({ ...draft, [f.key]: v });
          return (
            <Field key={f.key} label={f.label} hint={f.hint} required={f.required}>
              {f.kind === 'textarea' ? (
                <textarea
                  rows={f.rows ?? 3}
                  value={value}
                  placeholder={f.placeholder}
                  onChange={(e) => onChange(e.target.value)}
                  className="input-field mt-1.5 resize-y"
                />
              ) : (
                <input
                  value={value}
                  placeholder={f.placeholder}
                  onChange={(e) => onChange(e.target.value)}
                  className="input-field mt-1.5"
                />
              )}
            </Field>
          );
        })}
      </div>

      {preview && <PreviewPanel>{preview(draft)}</PreviewPanel>}
      <SaveBar dirty={dirty} saving={saving} justSaved={justSaved} error={error} onSave={save} onDiscard={discard} />
    </SectionCard>
  );
}

export function HeroEditor({ initial, order }: { initial: HeroContent; order: number }) {
  return (
    <ObjectEditor<HeroContent>
      pageSlug="home"
      sectionKey="hero"
      order={order}
      icon={LayoutTemplate}
      title="Hero banner"
      description="The first thing visitors see at the top of the home page."
      initial={initial}
      fields={[
        { key: 'heading', label: 'Main heading', required: true, hint: 'Keep it short and clear — one line of big text.' },
        { key: 'subheading', label: 'Sub-heading', kind: 'textarea', rows: 2, required: true },
        { key: 'ctaLabel', label: 'Main button text', required: true, hint: 'For example “Book Now”.' },
      ]}
      preview={(d) => <Hero content={d} />}
    />
  );
}

export function ChatbotIntroEditor({ initial, order }: { initial: ChatbotIntroContent; order: number }) {
  return (
    <ObjectEditor<ChatbotIntroContent>
      pageSlug="home"
      sectionKey="chatbotIntro"
      order={order}
      icon={Bot}
      title="AI symptom checker banner"
      description="The dark banner that invites visitors to try the AI symptom checker."
      initial={initial}
      fields={[{ key: 'promptText', label: 'Invitation text', kind: 'textarea', rows: 2, required: true }]}
      preview={(d) => <ChatbotEntry content={d} />}
    />
  );
}

export function StoryEditor({ initial, order }: { initial: StoryContent; order: number }) {
  return (
    <ObjectEditor<StoryContent>
      pageSlug="about"
      sectionKey="story"
      order={order}
      icon={FileText}
      title="Our story"
      description="The heading and paragraph at the top of the About page."
      initial={initial}
      fields={[
        { key: 'heading', label: 'Heading', required: true },
        { key: 'body', label: 'Story text', kind: 'textarea', rows: 5, required: true },
      ]}
      preview={(d) => <Story content={d} />}
    />
  );
}

export function ContactDetailsEditor({ initial, order }: { initial: ContactDetailsContent; order: number }) {
  return (
    <ObjectEditor<ContactDetailsContent>
      pageSlug="contact"
      sectionKey="contactDetails"
      order={order}
      icon={Mail}
      title="Contact details"
      description="Address, email and phone shown beside the contact form."
      initial={initial}
      fields={[
        { key: 'address', label: 'Address', required: true },
        { key: 'email', label: 'Email', required: true, placeholder: 'hello@example.com' },
        { key: 'phone', label: 'Phone', required: true, placeholder: '+1 555 000 0000' },
      ]}
      preview={(d) => (
        <div className="p-6">
          <ContactDetails content={d} />
        </div>
      )}
    />
  );
}

/* ------------------------------------------------------------------ */
/* List sections                                                        */
/* ------------------------------------------------------------------ */

export function FaqEditor({ initial, order }: { initial: FaqContent; order: number }) {
  return (
    <ItemListEditor<FaqItem>
      pageSlug="home"
      sectionKey="faq"
      order={order}
      icon={HelpCircle}
      title="Frequently asked questions"
      description="Shown on the home page. Visitors click a question to read the answer."
      items={initial.items}
      noun="FAQ"
      nounPlural="FAQs"
      newItem={() => ({ question: '', answer: '', active: true })}
      itemTitle={(i) => i.question}
      itemProblem={(i) => (!i.question.trim() ? 'the question is empty' : !i.answer.trim() ? 'the answer is empty' : null)}
      renderFields={(item, update) => (
        <>
          <Field label="Question" required>
            <input
              value={item.question}
              onChange={(e) => update({ question: e.target.value })}
              placeholder="e.g. How quickly can I see a doctor?"
              className="input-field mt-1.5"
            />
          </Field>
          <Field label="Answer" required>
            <textarea
              rows={4}
              value={item.answer}
              onChange={(e) => update({ answer: e.target.value })}
              placeholder="Write a clear, friendly answer."
              className="input-field mt-1.5 resize-y"
            />
          </Field>
        </>
      )}
      preview={(items) => <FaqAccordion content={{ items }} />}
    />
  );
}

export function TestimonialsEditor({ initial, order }: { initial: TestimonialsContent; order: number }) {
  return (
    <ItemListEditor<TestimonialItem>
      pageSlug="home"
      sectionKey="testimonials"
      order={order}
      icon={MessageSquareQuote}
      title="Patient testimonials"
      description="Short quotes from patients, shown on the home page with a star rating."
      items={initial.items}
      noun="testimonial"
      nounPlural="testimonials"
      newItem={() => ({ name: '', quote: '', rating: 5, verified: false, active: true })}
      itemTitle={(i) => i.name}
      itemMeta={(i) => (
        <span className="hidden items-center gap-0.5 text-magenta sm:flex" aria-label={`${i.rating} stars`}>
          {Array.from({ length: i.rating }).map((_, n) => (
            <Star key={n} size={12} fill="currentColor" strokeWidth={0} />
          ))}
        </span>
      )}
      itemProblem={(i) => (!i.name.trim() ? 'the patient name is empty' : !i.quote.trim() ? 'the quote is empty' : null)}
      renderFields={(item, update) => (
        <>
          <Field label="Patient name" required hint="First name and last initial works well, e.g. “Sara K.”">
            <input value={item.name} onChange={(e) => update({ name: e.target.value })} className="input-field mt-1.5" />
          </Field>
          <Field label="What they said" required>
            <textarea
              rows={3}
              value={item.quote}
              onChange={(e) => update({ quote: e.target.value })}
              className="input-field mt-1.5 resize-y"
            />
          </Field>
          <StarRating value={item.rating} onChange={(rating) => update({ rating })} />
          <Toggle
            checked={item.verified}
            onChange={(verified) => update({ verified })}
            label="Verified patient"
            hint="Shows a green check mark next to the name."
          />
        </>
      )}
      preview={(items) => <Testimonials content={{ items }} />}
    />
  );
}

export function FeaturesEditor({ initial, order }: { initial: FeaturesContent; order: number }) {
  return (
    <ItemListEditor<FeatureItem>
      pageSlug="home"
      sectionKey="features"
      order={order}
      icon={Sparkles}
      title="Feature cards"
      description="The “Care built around when you need it” cards on the home page."
      items={initial.items}
      noun="feature"
      nounPlural="features"
      newItem={() => ({ icon: 'Star', title: '', description: '', active: true })}
      itemTitle={(i) => i.title}
      itemMeta={(i) => {
        const Icon = iconFor(i.icon);
        return (
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-magenta">
            <Icon size={16} />
          </span>
        );
      }}
      itemProblem={(i) => (!i.title.trim() ? 'the title is empty' : !i.description.trim() ? 'the description is empty' : null)}
      renderFields={(item, update) => (
        <>
          <Field label="Title" required>
            <input value={item.title} onChange={(e) => update({ title: e.target.value })} className="input-field mt-1.5" />
          </Field>
          <Field label="Description" required>
            <textarea
              rows={2}
              value={item.description}
              onChange={(e) => update({ description: e.target.value })}
              className="input-field mt-1.5 resize-y"
            />
          </Field>
          <IconPicker value={item.icon} onChange={(icon) => update({ icon })} />
        </>
      )}
      preview={(items) => <FeaturesGrid content={{ items }} />}
    />
  );
}

export function StatsEditor({ initial, order }: { initial: StatsContent; order: number }) {
  return (
    <ItemListEditor<StatItem>
      pageSlug="about"
      sectionKey="stats"
      order={order}
      icon={TrendingUp}
      title="Statistics"
      description="The big animated numbers on the About page."
      items={initial.items}
      noun="stat"
      nounPlural="stats"
      newItem={() => ({ value: '', label: '', active: true })}
      itemTitle={(i) => [i.value, i.label].filter(Boolean).join(' — ')}
      itemProblem={(i) => (!i.value.trim() ? 'the number is empty' : !i.label.trim() ? 'the label is empty' : null)}
      renderFields={(item, update) => (
        <div className="grid gap-4 sm:grid-cols-[10rem_1fr]">
          <Field label="Number" required hint="e.g. 1,000+ or 24/7">
            <input value={item.value} onChange={(e) => update({ value: e.target.value })} className="input-field mt-1.5" />
          </Field>
          <Field label="Label" required hint="e.g. Consultations completed">
            <input value={item.label} onChange={(e) => update({ label: e.target.value })} className="input-field mt-1.5" />
          </Field>
        </div>
      )}
      preview={(items) => <StatsCounters content={{ items }} />}
    />
  );
}
