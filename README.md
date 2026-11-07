# AR/VR Hub â€” BMSIT&M

Website for the AR/VR Hub at BMS Institute of Technology and Management. It presents the club's XR Skill Lab and accepts workshop registrations for the two-day, 12-hour event on **19â€“20 November 2026**.

The home page is a nine-section, scroll-driven story backed by a shared 3D scene. Students register at `/register`; registrations, duplicate checks, and live capacity status are handled through Next.js API routes backed by Supabase.

## Getting started

Requirements: Node.js 18.17 or newer and npm.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Copy `.env.example` to `.env.local` and set the URL and publishable key for your Supabase project before using registration. The app can still run without them, but registration APIs report that Supabase is not configured.

For a production build:

```bash
npm run build
npm run start
```

Next.js downloads the fonts declared in `src/app/layout.tsx` from Google Fonts, so builds require network access.

## Supabase setup

Create a Supabase project, then run [`supabase/schema.sql`](supabase/schema.sql) in its SQL Editor. Configure these variables in `.env.local` when using your own project:

| Variable | Purpose | Default |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | None; set in `.env.local` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase publishable/anon key | None; set in `.env.local` |
| `REGISTRATION_CAP` | Maximum registrations accepted by the API | `100` |
| `SHORTLIST_CAP` | Shortlist size shown by the API | `40` |

The schema's database trigger also enforces a **100-registration** maximum. If you change `REGISTRATION_CAP`, update the trigger in `supabase/schema.sql` to match. `SHORTLIST_CAP` controls the API-reported shortlist count; shortlisting itself is managed through the `shortlisted` column and `shortlist_view`.

The SQL schema grants anonymous users `SELECT` access to the registrations table for the current API's count, status, and duplicate-check queries. That makes registration records readable to clients using the public key. Review and replace this policy with a server-only access design before using this schema for sensitive or production data.

## Available scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Next.js development server |
| `npm run build` | Create a production build |
| `npm run start` | Serve the production build |
| `npm run typecheck` | Run TypeScript without emitting files |
| `npm run check:shaders` | Check GLSL shader source for common issues |
| `npm run report:model` | Report headset model geometry and material details |

To prepare a headset model, run `node scripts/prepare_owner_model.mjs <input.glb> <output.glb> [--ratio r] [--err e] [--rot-deg d]`. The script uses the `@gltf-transform` packages listed in `devDependencies`.

## Project structure

```text
src/app/                 Next.js routes, global styles, and registration APIs
src/components/home/     Home page sections
src/components/register/ Registration flow
src/components/scene/    Shared React Three Fiber scene and layers
src/content/skillLab.ts  Workshop copy, curriculum, and module timings
src/config/club.ts       Club identity, navigation, and social links
src/lib/                 Supabase client, validation, motion, and theme helpers
supabase/schema.sql      Registration table, policies, trigger, and view
public/models/           Headset GLB and asset credits
scripts/                 Shader and model utilities
```

## Registration API

- `POST /api/register` validates and stores a registration, rejects duplicate email, phone, or USN values, and enforces the configured cap.
- `GET /api/register/check?email=...&phone=...&usn=...` checks whether a student is already registered.
- `GET /api/register/status` returns database readiness, registration count, remaining capacity, and whether registration is closed.

The browser form validates each step with Zod and React Hook Form. In-progress form values are saved in `sessionStorage` (consent is never saved). A successful or recognized existing registration is summarized in browser storage for the confirmation view.

## 3D scene and motion

`SceneShell` mounts a single client-side WebGL canvas from the shared app layout. Scene layers are coordinated by keyframes in `src/lib/keyframes.ts` and mutable per-frame values in `src/lib/motion.ts`; React state is reserved for lower-frequency UI and scene state. The scene includes a procedural backdrop, grid, stars, rings, headset model, curriculum corridor, method cycle, and registration progress ring.

The headset asset is `public/models/headset.glb`. Its provenance and license notes are in [`public/models/CREDITS.md`](public/models/CREDITS.md); confirm redistribution rights before publishing the model. Run `npm run report:model` to inspect its geometry and materials.

## Content, styling, and accessibility

Workshop copy and curriculum data live in [`src/content/skillLab.ts`](src/content/skillLab.ts); club identity and social links live in [`src/config/club.ts`](src/config/club.ts). Global design tokens and components are in `src/app/globals.css`.

The canvas is decorative and hidden from assistive technology; page content remains in the DOM. The app includes a skip link, keyboard-operable controls, visible focus styles, reduced-motion handling, and fallbacks for unavailable WebGL. The scene quality tier can be cycled with **Alt+Shift+Q**.
