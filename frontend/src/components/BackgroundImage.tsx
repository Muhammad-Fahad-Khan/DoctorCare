import { assetUrl } from '../lib/api';

/**
 * Absolutely-positioned cover image + a tint layer that keeps text readable on top of it.
 * Put it as the first child of a `relative overflow-hidden` container.
 */
export function BackgroundImage({ src, overlay }: { src?: string; overlay: string }) {
  if (!src) return null;
  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${JSON.stringify(assetUrl(src))})` }}
      />
      <div aria-hidden className={`pointer-events-none absolute inset-0 ${overlay}`} />
    </>
  );
}
