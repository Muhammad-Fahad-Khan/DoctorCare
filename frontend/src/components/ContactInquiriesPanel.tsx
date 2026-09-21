import { ReactNode, useEffect, useMemo, useState } from 'react';
import { Check, CheckCircle2, Inbox, Mail, Reply, Search, SearchX, X } from 'lucide-react';
import { api, ContactInquiry } from '../lib/api';
import { formatWhen } from '../lib/format';

const FILTERS = ['All', 'New', 'Handled'] as const;
type Filter = (typeof FILTERS)[number];

/** Wraps every match of `query` in <mark> so admins can see why a row matched. */
function highlight(text: string, query: string): ReactNode {
  const q = query.trim();
  if (!q) return text;
  const parts = text.split(new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
  return parts.map((part, i) =>
    part.toLowerCase() === q.toLowerCase() ? (
      <mark key={i} className="rounded bg-orchid/60 px-0.5 text-royal">
        {part}
      </mark>
    ) : (
      part
    ),
  );
}

export function ContactInquiriesPanel() {
  const [inquiries, setInquiries] = useState<ContactInquiry[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('All');

  function refresh() {
    api.listContactInquiries().then(setInquiries).catch(() => setError('Could not load inquiries.'));
  }

  useEffect(refresh, []);

  async function markHandled(id: string) {
    try {
      await api.markInquiryHandled(id);
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update this inquiry.');
    }
  }

  // Search first, then count each status inside the search results so the pill numbers always match the list.
  const matching = useMemo(() => {
    const q = query.trim().toLowerCase();
    const sorted = [...(inquiries ?? [])].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    if (!q) return sorted;
    return sorted.filter((i) => [i.name, i.email, i.message].some((field) => field.toLowerCase().includes(q)));
  }, [inquiries, query]);

  const counts = {
    All: matching.length,
    New: matching.filter((i) => !i.handled).length,
    Handled: matching.filter((i) => i.handled).length,
  };
  const visible = matching.filter((i) => (filter === 'All' ? true : filter === 'New' ? !i.handled : i.handled));

  if (inquiries === null && !error) {
    return <p className="text-sm text-royal/60">Loading…</p>;
  }

  return (
    <div>
      {error && (
        <p role="alert" className="mb-4 rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-600">
          {error}
        </p>
      )}

      {inquiries && inquiries.length === 0 ? (
        <div className="glass-card flex flex-col items-center gap-2 px-6 py-14 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-soft text-magenta">
            <Inbox size={26} />
          </span>
          <p className="mt-2 text-base font-bold text-royal">No inquiries yet</p>
          <p className="text-sm text-royal/60">Messages sent from the Contact page will show up here.</p>
        </div>
      ) : (
        <>
          {/* Search */}
          <div className="relative">
            <Search size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-royal/40" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, email or message…"
              aria-label="Search inquiries"
              className="input-field !rounded-full !py-3 !pl-11 !pr-11 [&::-webkit-search-cancel-button]:hidden"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-royal/50 transition-colors hover:bg-royal/5 hover:text-royal"
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Status filter */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                aria-pressed={filter === f}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-300 ease-docucare ${
                  filter === f ? 'bg-royal text-white shadow-md' : 'bg-royal/5 text-royal/70 hover:bg-royal/10'
                }`}
              >
                {f}
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] leading-none ${
                    filter === f ? 'bg-white/20' : 'bg-white text-royal/60'
                  }`}
                >
                  {counts[f]}
                </span>
              </button>
            ))}
            <span className="ml-auto text-xs text-royal/50" aria-live="polite">
              {query.trim() ? `${visible.length} result${visible.length === 1 ? '' : 's'}` : ''}
            </span>
          </div>

          {/* Results */}
          {visible.length === 0 ? (
            <div className="glass-card mt-4 flex flex-col items-center gap-2 px-6 py-12 text-center">
              <SearchX size={26} className="text-royal/35" />
              <p className="mt-1 text-sm font-semibold text-royal">
                {query.trim() ? `Nothing matches “${query.trim()}”` : `No ${filter.toLowerCase()} inquiries`}
              </p>
              {(query || filter !== 'All') && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    setFilter('All');
                  }}
                  className="mt-1 text-xs font-semibold text-magenta hover:underline"
                >
                  Clear search and filters
                </button>
              )}
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {visible.map((inq) => (
                <article
                  key={inq.id}
                  className={`glass-card border-l-4 p-5 ${inq.handled ? 'border-l-mint/60' : 'border-l-magenta'}`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="flex items-center gap-2 text-base font-bold text-royal">
                        <Mail size={15} className="shrink-0 text-magenta" />
                        <span className="truncate">{highlight(inq.name, query)}</span>
                      </p>
                      <a
                        href={`mailto:${inq.email}`}
                        className="mt-0.5 block truncate text-sm text-royal/70 hover:text-magenta hover:underline"
                      >
                        {highlight(inq.email, query)}
                      </a>
                    </div>

                    <div className="flex flex-col items-end gap-1.5">
                      {inq.handled ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-mint/15 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                          <CheckCircle2 size={12} /> Handled
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-magenta/10 px-2.5 py-1 text-xs font-semibold text-magenta">
                          <span className="h-1.5 w-1.5 rounded-full bg-magenta" /> New
                        </span>
                      )}
                      <time dateTime={inq.createdAt} className="text-xs text-royal/50">
                        {formatWhen(inq.createdAt)}
                      </time>
                    </div>
                  </div>

                  <p className="mt-3 whitespace-pre-line break-words text-sm leading-relaxed text-royal/85">
                    {highlight(inq.message, query)}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <a
                      href={`mailto:${inq.email}?subject=${encodeURIComponent('Re: your message to DocuCare')}`}
                      className="btn-secondary !px-4 !py-2 text-xs"
                    >
                      <Reply size={13} /> Reply by email
                    </a>
                    {!inq.handled && (
                      <button
                        type="button"
                        onClick={() => markHandled(inq.id)}
                        className="btn-primary !px-4 !py-2 text-xs"
                      >
                        <Check size={13} /> Mark handled
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
