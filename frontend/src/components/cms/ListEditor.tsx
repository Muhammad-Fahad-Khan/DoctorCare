import { ReactNode, useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, ChevronDown, LucideIcon, Plus, Trash2 } from 'lucide-react';
import { PreviewPanel, Row, SaveBar, SectionCard, toRows, newRowId, useSectionEditor } from './shared';

function ItemCard({
  index,
  total,
  open,
  onToggle,
  title,
  meta,
  problem,
  autoFocus,
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
            <span className="block truncate text-sm font-semibold text-royal">{title}</span>
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

      {open && <div className="space-y-4 border-t border-royal/5 p-4 sm:p-5">{children}</div>}
    </div>
  );
}

/**
 * One editor for every "list of things" section (FAQs, testimonials, features, stats).
 * Add / edit / reorder / delete all happen in a local draft; nothing goes live until Save.
 */
export function ItemListEditor<T>({
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
      {count === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-royal/10 px-6 py-12 text-center">
          <p className="text-sm font-semibold text-royal">No {nounPlural} yet</p>
          <p className="mt-1 text-sm text-royal/50">Add your first one — it only takes a few seconds.</p>
          <button type="button" onClick={add} className="btn-primary mt-5 !px-5 !py-2.5 text-xs">
            <Plus size={14} /> Add {noun}
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          <p className="px-1 text-xs font-medium text-royal/40">
            {count} {count === 1 ? noun : nounPlural} · click one to edit, use the arrows to change the order
          </p>

          {draft.map((row, i) => (
            <ItemCard
              key={row._id}
              index={i}
              total={count}
              open={openIds.has(row._id)}
              onToggle={() => toggle(row._id)}
              title={itemTitle(row.data).trim() || <span className="font-normal italic text-royal/40">New {noun} — click to fill in</span>}
              meta={itemMeta?.(row.data)}
              problem={attempted ? itemProblem(row.data) : null}
              autoFocus={justAdded === row._id}
              onMove={(dir) => move(i, dir)}
              onRemove={() => remove(row._id)}
            >
              {renderFields(row.data, (patch) => update(row._id, patch))}
            </ItemCard>
          ))}

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
