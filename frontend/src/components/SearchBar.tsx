import { ReactNode } from 'react';
import { Search, SearchX, X } from 'lucide-react';

/** One search box used everywhere a list of data is shown, so it looks and behaves the same on every screen. */
export function SearchBar({
  value,
  onChange,
  placeholder = 'Search…',
  className = '',
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      <Search size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-royal/40" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Escape' && onChange('')}
        placeholder={placeholder}
        aria-label={placeholder}
        className="input-field !rounded-full !py-3 !pl-11 !pr-11 [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-royal/50 transition-colors hover:bg-royal/5 hover:text-royal"
        >
          <X size={15} />
        </button>
      )}
    </div>
  );
}

/** Wraps every match of `query` inside `text` in <mark>, so people can see why a row matched. */
export function Highlight({ text, query }: { text: string; query: string }): ReactNode {
  const q = query.trim();
  if (!q) return text;
  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return (
    <>
      {text.split(new RegExp(`(${escaped})`, 'gi')).map((part, i) =>
        part.toLowerCase() === q.toLowerCase() ? (
          <mark key={i} className="rounded bg-orchid/60 px-0.5 text-royal">
            {part}
          </mark>
        ) : (
          part
        ),
      )}
    </>
  );
}

/** Shown when a search (or filter) leaves nothing to display. */
export function NoResults({ query, onClear }: { query: string; onClear: () => void }) {
  return (
    <div className="glass-card mt-4 flex flex-col items-center gap-2 px-6 py-10 text-center">
      <SearchX size={26} className="text-royal/35" />
      <p className="mt-1 text-sm font-semibold text-royal">Nothing matches “{query.trim()}”</p>
      <button type="button" onClick={onClear} className="text-xs font-semibold text-magenta hover:underline">
        Clear search
      </button>
    </div>
  );
}
