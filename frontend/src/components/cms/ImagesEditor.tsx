import { useRef, useState } from 'react';
import { ImageIcon, ImageOff, Loader2, Trash2, Upload } from 'lucide-react';
import { api, assetUrl } from '../../lib/api';
import { DEFAULT_IMAGES, IMAGE_LIBRARY } from '../../lib/images';
import { ImagesContent } from '../../types/cms';
import { SaveBar, SectionCard, useSectionEditor } from './shared';

const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPT = 'image/jpeg,image/png,image/webp,image/gif';

function ImageField({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  value: string;
  onChange: (url: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const [broken, setBroken] = useState(false);

  async function onFile(file: File | undefined) {
    if (!file) return;
    setProblem(null);
    if (!ACCEPT.split(',').includes(file.type)) return setProblem('Please choose a JPG, PNG, WebP or GIF image.');
    if (file.size > MAX_BYTES) return setProblem('That image is over 5 MB. Please choose a smaller one.');

    setUploading(true);
    try {
      const { url } = await api.uploadImage(file);
      setBroken(false);
      onChange(url);
    } catch (err) {
      setProblem(err instanceof Error ? err.message : 'Could not upload this image.');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = ''; // allow re-picking the same file
    }
  }

  const isLink = /^https?:\/\//.test(value);

  return (
    <div className="rounded-2xl border border-royal/10 bg-white p-4 sm:p-5">
      <p className="text-sm font-bold text-royal">{label}</p>
      <p className="mt-0.5 text-xs text-royal/50">{hint}</p>

      <div className="mt-4 grid gap-5 sm:grid-cols-[15rem_1fr]">
        {/* Current image */}
        <div className="relative aspect-video overflow-hidden rounded-xl border border-royal/10 bg-surface">
          {value && !broken ? (
            <img
              src={assetUrl(value)}
              alt=""
              onError={() => setBroken(true)}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-1.5 text-royal/35">
              <ImageOff size={22} />
              <span className="text-xs font-medium">{value ? "Can't load this image" : 'No image'}</span>
            </div>
          )}
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/70">
              <Loader2 className="animate-spin text-magenta" size={24} />
            </div>
          )}
        </div>

        <div className="min-w-0 space-y-4">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="btn-primary !px-4 !py-2 text-xs disabled:opacity-50"
            >
              <Upload size={14} /> Upload image
            </button>
            {value && (
              <button
                type="button"
                onClick={() => {
                  setBroken(false);
                  onChange('');
                }}
                className="btn-secondary !px-4 !py-2 text-xs"
              >
                <Trash2 size={14} /> No image
              </button>
            )}
            <input
              ref={fileRef}
              type="file"
              accept={ACCEPT}
              className="sr-only"
              onChange={(e) => onFile(e.target.files?.[0])}
            />
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-royal/40">Or pick a ready-made one</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {IMAGE_LIBRARY.map((img) => (
                <button
                  key={img.url}
                  type="button"
                  aria-pressed={value === img.url}
                  onClick={() => {
                    setBroken(false);
                    onChange(img.url);
                  }}
                  className={`w-24 overflow-hidden rounded-lg border-2 text-left transition-all duration-300 ease-docucare ${
                    value === img.url ? 'border-magenta shadow-md' : 'border-transparent ring-1 ring-royal/10 hover:ring-magenta/40'
                  }`}
                >
                  <img src={img.url} alt="" className="aspect-video w-full object-cover" />
                  <span className="block bg-white px-1.5 py-1 text-[10px] font-semibold text-royal/70">{img.label}</span>
                </button>
              ))}
            </div>
          </div>

          <label className="block">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-royal/40">Or paste an image link</span>
            <input
              value={isLink ? value : ''}
              onChange={(e) => {
                setBroken(false);
                onChange(e.target.value.trim());
              }}
              placeholder="https://…"
              className="input-field mt-1.5 !py-2 text-xs"
            />
          </label>

          {problem && (
            <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-xs text-red-600">
              {problem}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export interface ImageSlot {
  key: keyof ImagesContent;
  label: string;
  hint: string;
}

/**
 * Background images for one page. Missing values fall back to the built-in defaults; "No image" is saved as an
 * empty string so the site can tell "admin removed it" apart from "admin never touched it".
 */
export function ImagesEditor({
  pageSlug,
  initial,
  slots,
  title = 'Background images',
  description,
}: {
  pageSlug: string;
  initial: ImagesContent | undefined;
  slots: ImageSlot[];
  title?: string;
  description: string;
}) {
  const [start] = useState<ImagesContent>(() =>
    Object.fromEntries(slots.map((s) => [s.key, initial?.[s.key] ?? DEFAULT_IMAGES[s.key]])),
  );

  const { draft, setDraft, dirty, saving, justSaved, error, save, discard } = useSectionEditor<ImagesContent>({
    pageSlug,
    sectionKey: 'images',
    order: 99,
    initial: start,
    toContent: (d) => ({ ...d }),
  });

  return (
    <SectionCard icon={ImageIcon} title={title} description={description}>
      <div className="space-y-4">
        {slots.map((slot) => (
          <ImageField
            key={slot.key}
            label={slot.label}
            hint={slot.hint}
            value={draft[slot.key] ?? ''}
            onChange={(url) => setDraft({ ...draft, [slot.key]: url })}
          />
        ))}
      </div>
      <p className="mt-4 text-xs text-royal/45">
        Tip: soft, light images look best — text sits on top of them. JPG, PNG, WebP or GIF, up to 5 MB. The picture
        goes live when you press <strong className="text-royal/70">Save changes</strong>.
      </p>
      <SaveBar dirty={dirty} saving={saving} justSaved={justSaved} error={error} onSave={save} onDiscard={discard} />
    </SectionCard>
  );
}
