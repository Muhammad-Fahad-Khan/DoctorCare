// Maps whatever specialty wording the AI produces ("Orthopedist", "Cardiology", "skin doctor")
// onto the specialty strings doctors actually registered with, so the recommendation always
// lines up with real doctors in the database.

export const FALLBACK_SPECIALTY = 'General Physician';

// concept -> alternative wordings (all lower-case, punctuation-free)
const ALIASES: Record<string, string[]> = {
  'general physician': ['general practitioner', 'gp', 'family doctor', 'family physician', 'physician', 'internist', 'internal medicine', 'general medicine', 'primary care', 'primary care physician', 'general doctor'],
  cardiologist: ['cardiology', 'cardiac specialist', 'heart specialist', 'heart doctor'],
  dermatologist: ['dermatology', 'skin specialist', 'skin doctor'],
  neurologist: ['neurology', 'brain specialist', 'nerve specialist'],
  pediatrician: ['paediatrician', 'pediatrics', 'paediatrics', 'pediatric', 'paediatric', 'child specialist', 'children doctor', 'kids doctor'],
  'orthopedic surgeon': ['orthopedist', 'orthopaedist', 'orthopedic', 'orthopaedic', 'orthopedics', 'orthopaedics', 'orthopaedic surgeon', 'orthopedic specialist', 'bone specialist', 'bone doctor'],
  psychiatrist: ['psychiatry', 'mental health specialist', 'psychologist', 'psychotherapist', 'mental health'],
  'ent specialist': ['ent', 'ent doctor', 'ent surgeon', 'otolaryngologist', 'otolaryngology', 'ear nose and throat', 'ear nose throat', 'ear nose and throat specialist'],
  gynecologist: ['gynaecologist', 'gynecology', 'gynaecology', 'obstetrician', 'obgyn', 'ob gyn', 'obstetrician gynecologist', 'womens health specialist'],
  ophthalmologist: ['ophthalmology', 'eye specialist', 'eye doctor', 'optometrist'],
  endocrinologist: ['endocrinology', 'diabetologist', 'diabetes specialist', 'thyroid specialist'],
  dentist: ['dental', 'dental surgeon', 'dentistry', 'oral surgeon', 'orthodontist', 'endodontist'],
  'pain specialist': ['pain management', 'pain management specialist', 'pain doctor', 'pain medicine', 'pain physician'],
  urologist: ['urology'],
  gastroenterologist: ['gastroenterology', 'gi specialist', 'stomach specialist'],
  pulmonologist: ['pulmonology', 'lung specialist', 'chest specialist'],
  oncologist: ['oncology', 'cancer specialist'],
  nephrologist: ['nephrology', 'kidney specialist'],
  rheumatologist: ['rheumatology'],
};

const ALIAS_TO_CONCEPT = new Map<string, string>();
for (const [concept, alts] of Object.entries(ALIASES)) {
  ALIAS_TO_CONCEPT.set(concept, concept);
  for (const alt of alts) ALIAS_TO_CONCEPT.set(alt, concept);
}

function norm(s: string): string {
  return s
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function concept(s: string): string {
  const n = norm(s);
  return ALIAS_TO_CONCEPT.get(n) ?? ALIAS_TO_CONCEPT.get(n.replace(/\s*specialist$/, '')) ?? n;
}

/** Returns the entry of `available` that best matches `wanted`, or null if nothing fits. */
export function matchSpecialty(wanted: string | null | undefined, available: string[]): string | null {
  if (!wanted || !wanted.trim() || available.length === 0) return null;
  const n = norm(wanted);

  // 1. same wording (case / punctuation insensitive)
  const exact = available.find((a) => norm(a) === n);
  if (exact) return exact;

  // 2. same concept ("Orthopedist" ~ "Orthopedic Surgeon", "Cardiology" ~ "Cardiologist")
  const c = concept(wanted);
  const sameConcept = available.find((a) => concept(a) === c);
  if (sameConcept) return sameConcept;

  // 3. one wording contains the other as WHOLE words ("Senior Cardiologist" ~ "Cardiologist").
  //    Whole words only - a plain substring test would match "urologist" inside "neurologist".
  const padded = ` ${n} `;
  const contained = available.find((a) => {
    const ap = ` ${norm(a)} `;
    return ap.trim().length >= 4 && (ap.includes(padded) || padded.includes(ap));
  });
  return contained ?? null;
}

/** Like matchSpecialty, but falls back to a general physician so the patient is never stranded. */
export function resolveSpecialty(
  wanted: string | null | undefined,
  available: string[],
): { specialty: string | null; usedFallback: boolean } {
  const direct = matchSpecialty(wanted, available);
  if (direct) return { specialty: direct, usedFallback: false };
  if (!wanted || !wanted.trim()) return { specialty: null, usedFallback: false };
  const fallback = matchSpecialty(FALLBACK_SPECIALTY, available);
  return { specialty: fallback, usedFallback: !!fallback };
}
