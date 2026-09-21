# DocuCare

Open-source AI telemedicine platform with a dynamic CMS. React (Vite) + NestJS + MySQL (Prisma) + Groq + Jitsi.

## What's built in this slice

- **Database schema** (`backend/prisma/schema.prisma`) — all core tables: `User`, `DoctorProfile`,
  `AvailabilitySlot`, `Appointment`, `TriageSession`, `CmsPage`, `CmsSection`, `ContactInquiry`, `SystemSettings`.
- **CMS engine, end to end**: `GET /cms/pages/:slug` (public) and `PUT /admin/cms/pages/:slug/sections` (admin,
  not yet guarded — see below) on the backend; a `Home.tsx` page on the frontend that fetches the page once and
  renders each section through a `key -> component` registry (`renderSection` in `Home.tsx`).
- **Home page components**, styled to the design brief's color/glass/motion spec: `Hero`, `ChatbotEntry`,
  `FeaturesGrid`, `Testimonials`, `FaqAccordion`, plus shared `Navbar`/`Footer`.
- **Seed script** (`backend/prisma/seed.ts`) populates the Home page so it renders real content immediately.
- **AuthModule**: `POST /auth/register`, `POST /auth/login`, `GET /auth/me`. Password hashing via bcrypt,
  JWT issued on login. Patients get a token immediately on registration; doctors registering via
  `POST /auth/register` (with `specialty` + `licenseNumber`) land in `DoctorProfile.status = PENDING` and
  **cannot log in** until an Admin flips their status to `APPROVED` (that admin endpoint isn't built yet —
  do it directly in the DB for now, or via Prisma Studio — until the next bullet). Admin accounts can't
  self-register at all. `AdminCmsController` is now guarded with `JwtAuthGuard` + `RolesGuard(ADMIN)`.
  Also added `PATCH /auth/change-password` (any authenticated role; verifies `currentPassword` before setting
  a new one) plus an `Account` page at `/account` — this is what makes the seeded admin's default password
  actually changeable without going through Prisma Studio.
- **Admin doctor approval**: `GET /admin/doctors?status=PENDING` (list, filter by `DoctorStatus`) and
  `PATCH /admin/doctors/:id/status` (`{ "status": "APPROVED" | "REJECTED" | "SUSPENDED" }`) — both admin-only.
  A doctor who registers can now actually be approved through the API instead of needing a manual DB edit.
- **AppointmentModule + DoctorsModule** — the full booking loop:
  - `GET /doctors?specialty=` — public directory of approved doctors (SRS 3.2 "Doctor Listing").
  - `GET /doctors/:doctorProfileId/availability` — public, future & unbooked slots only.
  - `GET/POST /doctors/me/availability`, `DELETE /doctors/me/availability/:slotId` — doctor manages their own slots.
  - `POST /appointments` (patient) — books a slot; slot-claim + appointment-create run in a transaction so two
    patients racing the same slot can't both win. Generates a random `jitsiRoomName` (not derived from the
    appointment id, so it can't be guessed from a booking reference).
  - `GET /appointments/me` — works for both roles; the service filters by `patientId` or `doctorId` depending
    on `user.role`.
  - `PATCH /appointments/:id/status` (doctor, PENDING → ACCEPTED/REJECTED) — rejecting frees the slot back up.
  - `PATCH /appointments/:id/complete` (doctor, ACCEPTED → COMPLETED, with `doctorNotes`).
  - `PATCH /appointments/:id/cancel` (patient, PENDING/ACCEPTED → CANCELLED) — also frees the slot.
- **GroqModule** — AI triage + the admin AI settings panel:
  - `SystemSettings.groqApiKeyEncrypted` is AES-256-GCM encrypted with `ENCRYPTION_KEY` (never the raw key at
    rest). `GroqService.refresh()` rebuilds the in-memory `groq-sdk` client from the DB — called on boot and
    after every admin save, so key/model/temperature changes take effect with **no server restart**.
  - `GET/PUT /admin/settings/groq` (admin) — `GET` never returns the decrypted key, only `{ hasKey, model, temperature }`.
    `PUT` accepts a partial update (`apiKey` omitted keeps the current key; `apiKey: ""` clears it).
  - `POST /admin/settings/groq/test-connection` (admin) — the SRS's "Test Connection" button; makes one real
    call to Groq and reports ok/error.
  - `POST /triage/sessions` (patient) — starts a `TriageSession`, asks Groq for a structured JSON reply
    (`reply`, `detectedSymptoms`, `urgencyTag`, `recommendedSpecialty`, `summary`) via `response_format: json_object`.
  - `POST /triage/sessions/:id/messages` (patient) — continues the conversation, replaying full history.
  - `GET /triage/sessions/:id` (patient, own sessions only).
  - `recommendedSpecialty` stays `null` until the model has enough to commit — the frontend should only show
    "Book a Doctor" once it's set, and can pass the session id as `triageSessionId` into `POST /appointments`.
  - **Correction**: the design brief specified the npm package `@groq/groq-sdk` — that package does not exist.
    The real official SDK is `groq-sdk` (`import Groq from 'groq-sdk'`), confirmed against the npm registry and
    Groq's own repo; `package.json` and this module use the correct one.

- **Frontend auth + Patient Dashboard** — the first full loop wired to the backend above:
  - `AuthContext` (`login`, `register`, `logout`) stores the JWT in `localStorage` and validates it against
    `GET /auth/me` on load, so a stale/expired token doesn't silently pass as logged-in.
  - `Login` / `Register` pages — registering as a doctor shows the pending-approval message from the backend
    instead of a token; registering as a patient logs straight in.
  - `ProtectedRoute` guards `/patient`, `/doctor`, `/admin` by role and redirects to `/login` otherwise.
  - `PatientDashboard` has two tabs: **AI Triage & Booking** (`TriageChat` → once `recommendedSpecialty` is set,
    `DoctorBooking` lists matching doctors → their open slots → confirms via `POST /appointments`) and
    **My Appointments** (`AppointmentsList`, status filters, cancel action, a Join button that only appears
    within 10 minutes of the scheduled time — though it doesn't open Jitsi yet, see below).
  - `Navbar` now reflects real session state (shows the user's dashboard link + Log out instead of static links).
- **Doctor Dashboard** — two tabs:
  - **Appointment Queue** (`AppointmentQueue`) — status-filtered list; clicking a row opens `PatientBriefModal`,
    a slide-over showing the AI triage summary, detected symptoms, urgency, and full transcript for that patient
    (SRS 2.2 "Patient Detail View" / "Modal/Drawer slide-out"). From there: Accept/Decline a pending request, or
    mark an accepted one Completed with consultation notes.
  - **My Availability** (`AvailabilityManager`) — add/remove bookable time slots; already-booked slots can't be
    deleted (mirrors the backend's own guard).
  - Getting a doctor's own triage detail here required one backend change: `AppointmentsService.listMine` now
    also selects `detectedSymptoms` and `messages` on `triageSession`, so a doctor's own `GET /appointments/me`
    carries the full AI brief without needing access to `GET /triage/sessions/:id` (which stays patient-only —
    opening that endpoint to doctors broadly would've been a wider permission hole than necessary).
- **Admin Dashboard** — three tabs, all against real endpoints:
  - **Doctor Approvals** (`DoctorApprovalPanel`) — status-tabbed list with Approve/Reject/Suspend actions.
  - **Website Content** (`CmsEditor`) — one form per Home page section (hero, chatbot intro, features,
    testimonials, FAQ), each with its own Save button calling `PUT /admin/cms/pages/home/sections`. List
    sections (features/testimonials/FAQ) support add/remove rows. This is the literal "no-code" editor the
    SRS describes — saving here changes what `Home.tsx` renders immediately, no deploy needed.
  - **AI Settings** (`GroqSettingsPanel`) — key field (write-only; never shows the stored key back, blank =
    keep current), model dropdown, temperature slider, and a live Test Connection button.
  - **Seeding note**: since Admin accounts can't self-register (by design — see AuthModule), `prisma/seed.ts`
    now also creates one admin user. Default `admin@docucare.local` / `ChangeMe123!`, overridable via
    `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` env vars before running the seed. Change the password after
    first login via `/account` (see the AuthModule bullet above) — in any real deployment, do this immediately.
- **Jitsi consultation room** — the last piece from the design brief:
  - Backend: added `GET /appointments/:id` (patient or doctor owner only) — needed because `ConsultationRoom`
    has to fetch one appointment by id from a route param; `GET /appointments/me` only returns the list.
  - Frontend: `@jitsi/react-sdk`'s `<JitsiMeeting>` embeds the call at `meet.jit.si` using the appointment's
    existing `jitsiRoomName` — no separate Jitsi account or server needed, matching the SRS's "no license, no
    download" requirement. `ConsultationRoom` blocks entry unless the appointment is `ACCEPTED`.
  - The "Join" button on both `AppointmentsList` (patient) and `AppointmentQueue` (doctor) now links to
    `/consultation/:id` and only appears within 10 minutes of the scheduled time — this was originally a
    frontend-only convenience gate (see the note that used to be here). **Fixed below.**

### Follow-up fix: server-side join window

`GET /appointments/:id` now computes the join window itself (10 minutes before → 3 hours after `scheduledAt`,
and only while `status === ACCEPTED`) and returns `canJoin: boolean` plus `jitsiRoomName: string | null` —
the room name is withheld entirely outside that window, not just hidden in the UI. `ConsultationRoom` checks
`canJoin` before ever rendering `<JitsiMeeting>`. The frontend "Join" buttons in the dashboards are now just a
UI hint for *when* to show the button; the actual access control is this endpoint.

### About/Contact pages + Contact Inquiries

- New `ContactModule`: `POST /contact` (public) writes to the already-existing `ContactInquiry` table;
  `GET/PATCH /admin/contact-inquiries` (admin) lists and marks them handled — this is the SRS's "sent
  directly to the admin dashboard" behavior, now literally true.
- `About` page renders `story` + `stats` CMS sections (`StatsCounters` does a lightweight count-up animation
  parsed from each stat's display string, e.g. `"1,000+"` → animates the `1000` and keeps the `+`).
- `Contact` page renders the CMS-driven `contactDetails` section (address/email/phone with clickable
  mailto/tel links) next to the always-present `ContactForm`.
- `CmsEditor` is no longer Home-only — it now has its own internal Home/About/Contact tabs and fetches the
  right page per tab, plus new `StoryEditor`, `StatsEditor`, `ContactDetailsEditor` components.
- `AdminDashboard` gained a fourth tab, **Inquiries**, backed by `ContactInquiriesPanel`.
- `prisma/seed.ts` now also seeds the About and Contact pages so both render real content immediately.

### Live Groq model catalog

`GroqSettingsPanel`'s model dropdown previously only offered a hardcoded list. `GroqService.listModels()` now
calls the real `client.models.list()` (confirmed against Groq's own SDK source — response shape is
`{ data: [{ id, ... }] }`) via a new `GET /admin/settings/groq/models` (admin-only) endpoint. The frontend
fetches this on load and after a successful save or test connection, falling back to the hardcoded list if no
key is configured yet or the call fails — so the dropdown degrades gracefully instead of going blank.

## Not yet built (next slices)

Nothing tracked — every feature in the original SRS and design brief is implemented against a real backend.

## Verification status

- **Frontend**: `npm install`, `tsc -b`, and a full `vite build` were actually run in this session — all clean.
  This caught and fixed two real bugs: `CmsEditor.tsx`'s section-save helper didn't structurally satisfy
  `Record<string, unknown>` for typed content objects (fixed by loosening the helper's param type and casting
  at the API-call boundary), and `api.ts`'s `import.meta.env` had no type without a `vite-env.d.ts` (added).
  The build's only output is a chunk-size warning (the Jitsi SDK is large) — not an error, not addressed.
- **Backend**: `npm install` succeeded clean, but `npx prisma generate` could not run in this sandbox — Prisma's
  CLI fetches its query-engine binary from `binaries.prisma.sh`, which isn't reachable from this environment's
  network policy. That's an environment restriction here, not a problem with the schema or code; it'll work
  normally wherever this repo actually gets run. Practically: `@prisma/client`'s types don't exist until
  `prisma generate` runs, so the backend's own `tsc` build couldn't be verified in this session the way the
  frontend's was. The backend code has had careful manual review (types, guards, transaction logic) but not an
  actual compiler pass — run `npm run prisma:generate` yourself first thing, and treat any errors it surfaces
  as real findings rather than assuming everything here is exactly right.

## Running it

**Backend**
```bash
cd backend
cp .env.example .env   # fill in DATABASE_URL, ENCRYPTION_KEY, JWT_SECRET
npm install
npm run prisma:migrate
npm run prisma:seed
npm run dev        # http://localhost:4000
```

**Frontend**
```bash
cd frontend
cp .env.example .env
npm install
npm run dev               # http://localhost:5173
```

The Vite dev server proxies `/api/*` to the NestJS backend on port 4000 (see `vite.config.ts`).

## How the CMS pattern extends to other pages

1. Add rows to `CmsPage`/`CmsSection` for the new page (seed script or admin editor).
2. Add the new section's content shape to `frontend/src/types/cms.ts`.
3. Build the component, add one `case` to the `renderSection` switch in the page file.

No other frontend code changes — this is the mechanism the SRS calls "instant rendering" from Admin edits.
