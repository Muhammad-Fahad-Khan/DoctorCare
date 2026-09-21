import { ImagesContent } from '../types/cms';

export const DEFAULT_IMAGES: Required<ImagesContent> = {
  heroBackground: '/backgrounds/mesh.svg',
  ctaBackground: '/backgrounds/waves.svg',
  headerBackground: '/backgrounds/medical-pattern.svg',
};

/** Built-in backgrounds the admin can pick without uploading anything. */
export const IMAGE_LIBRARY = [
  { label: 'Soft mesh', url: '/backgrounds/mesh.svg' },
  { label: 'Waves', url: '/backgrounds/waves.svg' },
  { label: 'Medical pattern', url: '/backgrounds/medical-pattern.svg' },
] as const;

/** undefined -> default; '' -> admin deliberately chose "no image"; anything else -> that image. */
export function pickImage(images: ImagesContent | undefined, key: keyof ImagesContent): string {
  const value = images?.[key];
  return value === undefined ? DEFAULT_IMAGES[key] : value;
}
