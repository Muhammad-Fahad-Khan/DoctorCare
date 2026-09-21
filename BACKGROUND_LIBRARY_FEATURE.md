# Background Library — admin-managed website backgrounds

A reusable feature concept from DocuCare. Call it **"Background Library"** (or *"ready-made backgrounds + admin image slots"*).

**The idea in one sentence:** the website ships with a few tasteful, ready-made background designs, so it looks polished from day one — and an admin can swap any of them, upload their own picture, paste an image link, or remove the image, all without touching code.

---

## 1. Reusable prompt for future projects

Copy, paste and adjust the bracketed parts.

> Add a **Background Library** feature to my website.
>
> - The public pages have background "slots": **[Home hero, Home bottom banner, About header, Contact header]**.
> - Ship **3 ready-made background designs** as small SVG files in the frontend `public/backgrounds/` folder, using the brand colors **[#F1BCE4, #B87AB6, #9E35A7, #4E175D]**: a soft gradient mesh, layered waves, and a subtle pattern. They must be light and low-contrast so text stays readable.
> - Every slot uses a ready-made design **by default**, so the site looks good before the admin does anything.
> - In the admin CMS, each page tab gets a **"Background images"** card. For each slot the admin can: **upload an image**, **pick a ready-made design**, **paste an image link**, or choose **"No image"**. Show a live thumbnail of the current image. Nothing goes live until the admin presses **Save changes**.
> - Uploads: admin-only endpoint, JPG/PNG/WebP/GIF only, max 5 MB, check the file's real bytes (not just its name or MIME type), **reject SVG** uploads, save with a random file name, serve publicly from `/uploads/`, and keep the uploads folder out of git.
> - Rendering: a small `BackgroundImage` component draws the image as a cover background plus a light tint layer so the text on top stays readable.
> - "Never set" must behave differently from "removed on purpose": never set → use the default design; empty string → show no image.

---

## 2. How it works

### Three possible values per slot

| Stored value | Meaning | What visitors see |
|---|---|---|
| *(key missing)* | Admin never touched this slot | The built-in default design |
| `""` (empty string) | Admin chose **No image** | No background image |
| `"/backgrounds/waves.svg"`, `"/uploads/abc.jpg"`, or `"https://…"` | Admin picked / uploaded / pasted one | That image |

This is why saving writes **every** slot: after the first save the site can always tell "removed on purpose" apart from "never set".

### Where the data lives

Each page has one optional CMS section with the key `images`:

- `home` → `heroBackground`, `ctaBackground`
- `about` → `headerBackground`
- `contact` → `headerBackground`

No database change was needed: it reuses the existing CMS `upsert` (`PUT /admin/cms/pages/:slug/sections`) and the existing public read (`GET /cms/pages/:slug`).

### The three image sources

1. **Ready-made library** — files in `frontend/public/backgrounds/` (`mesh.svg`, `waves.svg`, `medical-pattern.svg`). Stored as `/backgrounds/<name>.svg`, served by the frontend.
2. **Upload** — `POST /admin/uploads/image` (admin only). Stored on disk in `backend/uploads/`, saved as `/uploads/<random>.<ext>`, served by the backend. The frontend prefixes these with the API base URL (`assetUrl()` in `frontend/src/lib/api.ts`).
3. **Pasted link** — any `https://` image URL, used as-is.

---

## 3. File map

**Frontend**

| File | Role |
|---|---|
| `frontend/public/backgrounds/mesh.svg`, `waves.svg`, `medical-pattern.svg` | The ready-made designs |
| `frontend/src/lib/images.ts` | `DEFAULT_IMAGES` (default per slot), `IMAGE_LIBRARY` (list shown in the admin), `pickImage()` (the never-set vs. removed rule) |
| `frontend/src/components/BackgroundImage.tsx` | Draws the cover image + tint layer inside a `relative overflow-hidden` container |
| `frontend/src/components/cms/ImagesEditor.tsx` | The admin "Background images" card (upload, library, link, remove, thumbnail, save bar) |
| `frontend/src/lib/api.ts` | `assetUrl()` and `api.uploadImage()` |
| `frontend/src/types/cms.ts` | `ImagesContent` type |
| `Hero.tsx`, `CtaBand.tsx`, `Story.tsx`, `pages/Contact.tsx` | Consumers: each takes a background and renders `<BackgroundImage />` |
| `pages/Home.tsx`, `About.tsx`, `Contact.tsx` | Read the `images` section and call `pickImage()` |
| `components/CmsEditor.tsx` | Adds an `<ImagesEditor />` to the Home, About and Contact tabs |

**Backend**

| File | Role |
|---|---|
| `backend/src/uploads/uploads.controller.ts` | `POST /admin/uploads/image`: admin-only, 5 MB limit, checks real file bytes, rejects SVG |
| `backend/src/uploads/uploads.module.ts`, `upload-dir.ts` | Module + upload folder (`UPLOAD_DIR` env var, default `backend/uploads`) |
| `backend/src/main.ts` | Serves the upload folder publicly at `/uploads/` |
| `.gitignore` | Ignores `backend/uploads/` |

---

## 4. Design rules that make it look good

- **Ready-made designs are light and soft.** Text sits on top, so backgrounds are pale lilac tones with low-contrast shapes.
- **A tint layer always sits on top of the image** (white fade on light sections, brand-gradient on the purple banner). This keeps text readable even if an admin uploads a busy photo.
- **Sensible fallbacks.** A broken link shows "Can't load this image" in the admin instead of a blank box.
- **Admin tip shown in the UI:** soft, light images work best.

---

## 5. Adding things later

**A new ready-made design**
1. Add an SVG (about 1600×900, `preserveAspectRatio="xMidYMid slice"`) to `frontend/public/backgrounds/`.
2. Add `{ label: 'My design', url: '/backgrounds/my-design.svg' }` to `IMAGE_LIBRARY` in `frontend/src/lib/images.ts`.

**A new background slot** (say, a Pricing page header)
1. Add the key to `ImagesContent` (`frontend/src/types/cms.ts`) and a default to `DEFAULT_IMAGES` (`frontend/src/lib/images.ts`).
2. Render `<BackgroundImage src={pickImage(images, 'yourKey')} overlay="…" />` in that section.
3. Add a slot to the `<ImagesEditor slots={[…]} />` on that page's CMS tab.

**Production notes**
- Set `UPLOAD_DIR` to a persistent volume, or uploads disappear when the server is rebuilt.
- Old uploaded files are not deleted when an image is replaced. Clean `backend/uploads/` by hand if it grows.
- If you also use an image CDN or object storage (S3, Cloudflare R2), replace the `writeFile` call in `uploads.controller.ts` and return that URL instead. The rest of the feature stays the same.
