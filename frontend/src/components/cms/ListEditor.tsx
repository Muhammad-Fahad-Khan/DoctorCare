import { ReactNode, useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, ChevronDown, Eye, EyeOff, LucideIcon, Plus, Trash2 } from 'lucide-react';
import { PreviewPanel, Row, SaveBar, SectionCard, toRows, newRowId, useSectionEditor } from './shared';
import { matches, stringValues } from '../../lib/search';
import { Highlight, NoResults, SearchBar } from '../SearchBar';

/** true unless explicitly turned off — so items saved before this feature existed still show. */
const isActive = (item: { active?: boolean }) => item.active !== false;

function ItemCard({
  index,
  total,
  open,
  onToggle,
  title,
  meta,
  problem,
  autoFocus,
  active,
  noun,
  onToggleActive,
  onMove,
  onRemove,
  children,
}: {
  index: number;
  total: number;
  open: boolean;
  onToggle: () => void;
  title: ReactNode;
  meta?: ReactNode;
  problem: string | null;
  autoFocus: boolean;
  active: boolean;
  noun: string;
  onToggleActive: () => void;
  onMove: (dir: -1 | 1) => void;
  onRemove: () => void;
  children: ReactNode;
}) {
  const [confirming, setConfirming] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // A freshly added item scrolls into view and puts the cursor in its first field.
  useEffect(() => {
    if (!autoFocus) return;
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    ref.current?.querySelector<HTMLElement>('input:not([type=checkbox]), textarea')?.focus({ preventScroll: true });
  }, [autoFocus]);

  return (
    <div
      ref={ref}
      className={`rounded-2xl border bg-white transition-all duration-300 ease-docucare ${
        problem ? 'border-red-300' : open ? 'border-magenta/30 shadow-soft' : 'border-royal/10'
      }`}
    >
      <div className="flex items-center gap-2 p-2 pr-3">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          className="flex min-w-0 flex-1 items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors hover:bg-orchid/10"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-royal/5 text-xs font-bold text-royal/60">
            {index + 1}
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-2">
              <span className="truncate text-sm font-semibold text-royal">{title}</span>
              {!active && (
                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-royal/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-royal/50">
                  <EyeOff size={10} /> Inactive
                </span>
              )}
            </span>
            {problem && <span className="block text-xs text-red-600">Needs attention: {problem}</span>}
          </span>
          {meta}
          <ChevronDown
            size={16}
            className={`shrink-0 text-royal/40 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
          />
        </button>

        {confirming ? (
          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-medium text-royal/60">Delete?</span>
            <button
              type="button"
              onClick={onRemove}
              className="rounded-full bg-red-600 px-3 py-1.5 font-semibold text-white transition-colors hover:bg-red-700"
            >
              Yes
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="rounded-full px-3 py-1.5 font-semibold text-royal/60 hover:bg-royal/5"
            >
              No
            </button>
          </div>
        ) : (
          <div className="flex items-center">
            <button
              type="button"
              onClick={onToggleActive}
              aria-pressed={active}
              title={active ? `Active — shown on the website. Click to hide this ${noun}.` : `Inactive — hidden from the website. Click to show this ${noun}.`}
              className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                active ? 'text-mint hover:bg-mint/10' : 'text-royal/35 hover:bg-royal/5 hover:text-royal/60'
              }`}
            >
              {active ? <Eye size={15} /> : <EyeOff size={15} />}
            </button>
            <span className="mx-0.5 h-5 w-px bg-royal/10" aria-hidden />
            <button
              type="button"
              onClick={() => onMove(-1)}
              disabled={index === 0}
              aria-label="Move up"
              className="flex h-8 w-8 items-center justify-center rounded-full text-royal/40 transition-colors hover:bg-royal/5 hover:text-royal disabled:opacity-25 disabled:hover:bg-transparent"
            >
              <ArrowUp size={15} />
            </button>
            <button
              type="button"
              onClick={() => onMove(1)}
              disabled={index === total - 1}
              aria-label="Move down"
              className="flex h-8 w-8 items-center justify-center rounded-full text-royal/40 transition-colors hover:bg-royal/5 hover:text-royal disabled:opacity-25 disabled:hover:bg-transparent"
            >
              <ArrowDown size={15} />
            </button>
            <button
              type="button"
              onClick={() => setConfirming(true)}
              aria-label="Delete"
              className="flex h-8 w-8 items-center justify-center rounded-full text-royal/40 transition-colors hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 size={15} />
            </button>
          </div>
        )}
      </div>

      {open && (
        <div className="space-y-4 border-t border-royal/5 p-4 sm:p-5">
          <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-royal/10 bg-surface/60 px-4 py-3">
            <span>
              <span className="block text-sm font-semibold text-royal">Active</span>
              <span className="block text-xs text-royal/50">
                {active ? 'Shown to visitors on the website.' : 'Hidden from visitors, but kept here for later.'}
              </span>
            </span>
            <input type="checkbox" checked={active} onChange={onToggleActive} className="peer sr-only" />
            <span
              aria-hidden
              className="relative h-6 w-11 shrink-0 rounded-full bg-royal/15 transition-colors duration-300 after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition-transform after:duration-300 peer-checked:bg-mint peer-checked:after:translate-x-5 peer-focus-visible:ring-2 peer-focus-visible:ring-magenta peer-focus-visible:ring-offset-2"
            />
          </label>

          {children}
        </div>
      )}
    </div>
  );
}

/**
 * One editor for every "list of things" section (FAQs, testimonials, features, stats).
 * Add / edit / reorder / delete all happen in a local draft; nothing goes live until Save.
 * Every item also carries an Active/Inactive switch, so an item can be kept without publishing it.
 */
export function ItemListEditor<T extends { active?: boolean }>({
  pageSlug,
  sectionKey,
  order,
  icon,
  title,
  description,
  items,
  noun,
  nounPlural,
  newItem,
  itemTitle,
  itemMeta,
  itemProblem,
  renderFields,
  preview,
}: {
  pageSlug: string;
  sectionKey: string;
  order: number;
  icon: LucideIcon;
  title: string;
  description: string;
  items: T[];
  noun: string; // "FAQ"
  nounPlural: string; // "FAQs"
  newItem: () => T;
  itemTitle: (item: T) => string;
  itemMeta?: (item: T) => ReactNode;
  itemProblem: (item: T) => string | null; // null = valid
  renderFields: (item: T, update: (patch: Partial<T>) => void) => ReactNode;
  preview?: (items: T[]) => ReactNode;
}) {
  const [initialRows] = useState(() => toRows(items));
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());
  const [justAdded, setJustAdded] = useState<string | null>(null);
  const [attempted, setAttempted] = useState(false);
  const [query, setQuery] = useState('');

  const { draft, setDraft, dirty, saving, justSaved, error, save, discard } = useSectionEditor<Row<T>[]>({
    pageSlug,
    sectionKey,
    order,
    initial: initialRows,
    toContent: (rows) => ({ items: rows.map((r) => r.data) }),
    validate: (rows) => {
      const bad = rows.findIndex((r) => itemProblem(r.data));
      return bad === -1 ? null : `${noun} ${bad + 1} is incomplete — please fill it in or delete it.`;
    },
  });

  function toggle(id: string) {
    setOpenIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function add() {
    const row: Row<T> = { _id: newRowId(), data: newItem() };
    setQuery(''); // otherwise the brand-new blank item would be filtered out of sight
    setDraft([...draft, row]);
    setOpenIds((prev) => new Set(prev).add(row._id));
    setJustAdded(row._id);
  }

  function update(id: string, patch: Partial<T>) {
    setDraft(draft.map((r) => (r._id === id ? { ...r, data: { ...r.data, ...patch } } : r)));
  }

  function move(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= draft.length) return;
    const next = [...draft];
    [next[index], next[target]] = [next[target], next[index]];
    setDraft(next);
  }

  function remove(id: string) {
    setDraft(draft.filter((r) => r._id !== id));
  }

  async function onSave() {
    setAttempted(true);
    const badIds = draft.filter((r) => itemProblem(r.data)).map((r) => r._id);
    if (badIds.length) setOpenIds((prev) => new Set([...prev, ...badIds]));
    if (await save()) setAttempted(false);
  }

  const count = draft.length;
  const shown = draft.filter((r) => matches(query, ...stringValues(r.data)));
  const searching = query.trim() !== '';

  return (
    <SectionCard
      icon={icon}
      title={title}
      description={description}
      action={
        <button type="button" onClick={add} className="btn-primary !px-4 !py-2 text-xs">
          <Plus size={14} /> Add {noun}
        </button>
      }
    >
      {/* Always visible, even with nothing (or nothing yet) to search. */}
      <SearchBar value={query} onChange={setQuery} placeholder={`Search ${nounPlural}…`} />

      {count === 0 ? (
        <div className="mt-4 rounded-2xl border-2 border-dashed border-royal/10 px-6 py-12 text-center">
          <p className="text-sm font-semibold text-royal">No {nounPlural} yet</p>
          <p className="mt-1 text-sm text-royal/50">Add your first one — it only takes a few seconds.</p>
          <button type="button" onClick={add} className="btn-primary mt-5 !px-5 !py-2.5 text-xs">
            <Plus size={14} /> Add {noun}
          </button>
        </div>
      ) : (
        <div className="mt-4 space-y-2.5">
          <p className="px-1 text-xs font-medium text-royal/50">
            {searching
              ? `Showing ${shown.length} of ${count} ${nounPlural}`
              : `${count} ${count === 1 ? noun : nounPlural} · click one to edit, use the arrows to change the order`}
          </p>

          {shown.length === 0 && <NoResults query={query} onClear={() => setQuery('')} />}

          {draft.map((row, i) =>
            shown.includes(row) ? (
              <ItemCard
                key={row._id}
                index={i}
                total={count}
                open={openIds.has(row._id)}
                onToggle={() => toggle(row._id)}
                title={
                  itemTitle(row.data).trim() ? (
                    <Highlight text={itemTitle(row.data)} query={query} />
                  ) : (
                    <span className="font-normal italic text-royal/40">New {noun} — click to fill in</span>
                  )
                }
                meta={itemMeta?.(row.data)}
                problem={attempted ? itemProblem(row.data) : null}
                autoFocus={justAdded === row._id}
                active={isActive(row.data)}
                noun={noun}
                onToggleActive={() => update(row._id, { active: !isActive(row.data) } as Partial<T>)}
                onMove={(dir) => move(i, dir)}
                onRemove={() => remove(row._id)}
              >
                {renderFields(row.data, (patch) => update(row._id, patch))}
              </ItemCard>
            ) : null,
          )}

          <button
            type="button"
            onClick={add}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-magenta/25 py-3.5 text-sm font-semibold text-magenta transition-all duration-300 ease-docucare hover:border-magenta/50 hover:bg-orchid/10"
          >
            <Plus size={16} /> Add another {noun}
          </button>
        </div>
      )}

      {preview && count > 0 && <PreviewPanel>{preview(draft.map((r) => r.data))}</PreviewPanel>}

      <SaveBar dirty={dirty} saving={saving} justSaved={justSaved} error={error} onSave={onSave} onDiscard={discard} />
    </SectionCard>
  );
}
