import { ReactNode, useState } from 'react';
import { AlertCircle, Check, Eye, EyeOff, Loader2, LucideIcon, RotateCcw, Save } from 'lucide-react';
import { api } from '../../lib/api';

/* ------------------------------------------------------------------ */
/* Draft rows: list items get a stable client-side id so reordering,   */
/* expanding and deleting never mix rows up.                            */
/* ------------------------------------------------------------------ */

export type Row<T> = { _id: string; data: T };

let rowCounter = 0;
export const newRowId = () => `row-${Date.now()}-${rowCounter++}`;
export const toRows = <T,>(items: T[]): Row<T>[] => items.map((data) => ({ _id: newRowId(), data }));

/* ------------------------------------------------------------------ */
/* useSectionEditor: draft + dirty tracking + save for ONE CMS section. */
/* ------------------------------------------------------------------ */

export function useSectionEditor<D>({
  pageSlug,
  sectionKey,
  order,
  initial,
  toContent,
  validate,
}: {
  pageSlug: string;
  sectionKey: string;
  order: number;
  initial: D;
  toContent: (draft: D) => Record<string, unknown>;
  validate?: (draft: D) => string | null;
}) {
  const [draft, setDraftRaw] = useState<D>(initial);
  const [saved, setSaved] = useState<D>(initial);
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);

  function setDraft(next: D | ((prev: D) => D)) {
    setDraftRaw(next);
    setError(null);
    setJustSaved(false);
  }

  async function save() {
    const problem = validate?.(draft) ?? null;
    if (problem) {
      setError(problem);
      return false;
    }
    setSaving(true);
    setError(null);
    try {
      await api.upsertCmsSection(pageSlug, { sectionKey, content: toContent(draft), order });
      setSaved(draft);
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 3000);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save this section.');
      return false;
    } finally {
      setSaving(false);
    }
  }

  function discard() {
    setDraftRaw(saved);
    setError(null);
  }

  return { draft, setDraft, dirty, saving, justSaved, error, save, discard };
}

/* ------------------------------------------------------------------ */
/* Small UI building blocks                                            */
/* ------------------------------------------------------------------ */

export function SectionCard({
  icon: Icon,
  title,
  description,
  action,
  children,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="glass-card p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-magenta">
            <Icon size={20} />
          </span>
          <div>
            <h2 className="text-base font-bold text-royal">{title}</h2>
            <p className="mt-0.5 max-w-md text-sm leading-relaxed text-royal/55">{description}</p>
          </div>
        </div>
        {action}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

/** Sticks to the bottom of the viewport while a long section is being edited, so Save is always in reach. */
export function SaveBar({
  dirty,
  saving,
  justSaved,
  error,
  onSave,
  onDiscard,
}: {
  dirty: boolean;
  saving: boolean;
  justSaved: boolean;
  error: string | null;
  onSave: () => void;
  onDiscard: () => void;
}) {
  return (
    <div className="sticky bottom-3 z-10 mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-royal/10 bg-white/95 px-4 py-3 shadow-lift backdrop-blur">
      <p role="status" className="flex min-w-0 items-center gap-2 text-sm">
        {error ? (
          <>
            <AlertCircle size={16} className="shrink-0 text-red-500" />
            <span className="text-red-600">{error}</span>
          </>
        ) : dirty ? (
          <>
            <span className="h-2 w-2 shrink-0 rounded-full bg-amber-500" />
            <span className="font-medium text-royal/70">You have unsaved changes</span>
          </>
        ) : justSaved ? (
          <>
            <Check size={16} className="shrink-0 text-mint" />
            <span className="font-medium text-mint">Saved — it's live on the website</span>
          </>
        ) : (
          <span className="text-royal/40">All changes saved</span>
        )}
      </p>

      <div className="flex items-center gap-2">
        {dirty && !saving && (
          <button
            type="button"
            onClick={onDiscard}
            className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold text-royal/60 transition-colors hover:bg-royal/5 hover:text-royal"
          >
            <RotateCcw size={13} /> Discard
          </button>
        )}
        <button
          type="button"
          onClick={onSave}
          disabled={!dirty || saving}
          className="btn-primary !px-5 !py-2 text-xs disabled:opacity-40"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </div>
  );
}

export function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-royal/70">
        {label}
        {required && <span className="text-magenta"> *</span>}
      </span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-royal/40">{hint}</span>}
    </label>
  );
}

/** Collapsible "what will visitors see?" panel that renders the real public component. */
export function PreviewPanel({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 text-xs font-semibold text-magenta transition-opacity hover:opacity-70"
      >
        {open ? <EyeOff size={14} /> : <Eye size={14} />}
        {open ? 'Hide live preview' : 'Show live preview'}
      </button>
      {open && (
        <div className="mt-3 max-h-[460px] overflow-auto rounded-2xl border border-royal/10 bg-surface">
          {children}
        </div>
      )}
    </div>
  );
}
