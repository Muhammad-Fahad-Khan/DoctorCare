/** True when the query is empty, or any of the given fields contains it (case-insensitive). */
export function matches(query: string, ...fields: (string | null | undefined)[]): boolean {
  const q = query.trim().toLowerCase();
  return !q || fields.some((f) => f?.toLowerCase().includes(q));
}

/** Every string value of an object — handy for "search all the text fields" on CMS items. */
export function stringValues(obj: unknown): string[] {
  return Object.values((obj ?? {}) as Record<string, unknown>).filter((v): v is string => typeof v === 'string');
}
