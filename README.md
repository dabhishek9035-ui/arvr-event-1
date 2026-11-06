# AR/VR Club · BMSIT&M — XR Skill Lab site

A dark, scroll-driven, 3D-backdrop website for the AR/VR Club at BMSIT&M. Its job is to
fill seats for the **2-day, 12-hour hands-on XR Skill Lab** (19 & 20 November 2026):
a nine-section scroll story on `/` and a four-step registration form on `/register`.

A single persistent WebGL scene (three.js via React Three Fiber) sits behind the whole
site and reacts to scroll, pointer and page — the headset, the corridor of gates, the
method loop and the progress ring are all one continuous world.

---

## Contents

- [Quick start](#quick-start)
- [Scripts](#scripts)
- [Tech stack](#tech-stack)
- [Content source of truth](#content-source-of-truth)
- [Architecture](#architecture)
- [The scene system](#the-scene-system)
- [Hero asset pipeline](#hero-asset-pipeline)
- [The method loop animation](#the-method-loop-animation)
- [Registration & the backend seam](#registration--the-backend-seam)
- [Design system & theming](#design-system--theming)
- [Accessibility & performance](#accessibility--performance)
- [Known tradeoffs](#known-tradeoffs)

---

## Quick start

```bash
npm install
npm run dev        # http://localhost:3000
```

Production:

```bash
npm run build
npm run start      # serves the .next build (add: -- -p 3100 for a custom port)
```

Requires Node 18.17+ (developed on Node 25). Fonts are fetched from Google Fonts at
build time, so the first build needs network access.

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Dev server with HMR |
| `npm run build` | Production build (static prerender) |
| `npm run start` | Serve the production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run check:shaders` | Static GLSL checks: `smoothstep` edge order, `pow(negative, y)`, missing tone-mapping/colour-space chunk |
| `npm run report:model` | Inspect `public/models/headset.glb` (triangles, materials, bounds, budgets) |
| `node scripts/prepare_owner_model.mjs <in.glb> <out.glb> [--ratio r] [--err e] [--rot-deg d]` | Hero-asset pipeline: weld → optional simplify → assign black PBR material → optional Y-rotation bake |

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router) + TypeScript |
| 3D | three 0.170 + @react-three/fiber 8 + drei 9 |
| Post-processing | @react-three/postprocessing (Bloom + Vignette + NEUTRAL ToneMapping, high tier only) |
| Scroll | lenis (smooth wheel), one rAF engine |
| Forms | react-hook-form + zod (`@hookform/resolvers`) |
| State | zustand — **low-frequency state only** |
| Motion (DOM) | framer-motion (`Reveal`, drawer, step transitions) |
| Icons | lucide-react |

The pairing matters: R3F 8 pairs with React 18; `three` and `@types/three` stay on the
same minor.

## Content source of truth

All copy, numbers and lists come from **Annexure A** — the *XR Technology Training
Programme for Engineering Students of BMSIT&M* — and live as typed constants in
[`src/content/skillLab.ts`](src/content/skillLab.ts). Module hours assert a 12-hour sum
in dev. Dates (19 & 20 November 2026) are owner-confirmed. Commercial details from the
annexure (CIN, GST, vendor contacts, prices) are deliberately **not** shown; the vendor
is credited once in the footer.

To change any copy, edit `src/content/skillLab.ts` — sections read from it; nothing is
hardcoded in components.

## Architecture

```
<html data-theme="holo">
  SceneShell  → client-only dynamic(ssr:false) → ONE <Canvas> (fixed, z-0, aria-hidden)
  RouteTracker / ScrollEngine   (route in store; Lenis + one rAF loop)
  <Header/> <main>{page}</main> <Footer/>   (z-1, all information lives in the DOM)
```

Non-negotiables (enforced throughout):

- **One canvas** for the whole site, mounted in `layout.tsx`, never remounted — routes
  cross-fade inside it.
- **Per-frame values live in a plain mutable object** (`src/lib/motion.ts`), read inside
  `useFrame`. React state / zustand hold only low-frequency values (theme, quality tier,
  XR-preview mode, register step, active section…).
- **Layers fade through eased `presence` values** (never hard `visible` toggles; the
  exception — `visible=false` when presence < 0.01 — is allowed).
- All smoothing is frame-rate independent: `k = 1 - exp(-min(dt, 0.05) * speed)`.
- Theme colours are shared `THREE.Color` instances eased per frame; shaders receive them
  **by reference**.
- Every colour-outputting fragment shader ends with the `FINISH` chunk
  (`tonemapping_fragment` → `colorspace_fragment`) and dithers dark gradients.
- No allocations inside `useFrame`; all temporaries hoisted at module scope.

### Scene layers (back to front)

| Layer | File | Shows |
|---|---|---|
| Backdrop | `scene/Backdrop.tsx` | Full-screen domain-warped fbm in graphite-indigo |
| Stars | `scene/Stars.tsx` | Camera-following twinkling shell |
| Grid floor | `scene/GridFloor.tsx` | World-locked XZ grid, drifts with scroll velocity |
| Rings | `scene/Rings.tsx` | Three orbiting tori + dark halo disc around the hero |
| **Hero** | `scene/HeroModel.tsx` | The headset (real GLB), auto-fitted, studio-lit |
| Dial | `scene/Dial.tsx` | 12 ticks around the hero; lights tick-by-tick through the Skill Lab section |
| Corridor | `scene/Corridor.tsx` | Nine octagonal gates the camera flies through during the pinned curriculum |
| Panels | `scene/Panels.tsx` | Floating spatial-UI quads (pointer parallax) |
| **Cycle ring** | `scene/CycleRing.tsx` | Six-step loop with progress arc + halos (method section) |
| Progress ring | `scene/ProgressRing.tsx` | Register-page arc that fills per completed step |
| Dust | `scene/Dust.tsx` | World-anchored motes that rise with scroll velocity |

### Keyframed choreography

`src/lib/keyframes.ts` holds one keyframe per section centre (`at = i + 0.5`): camera
position/look-at, hero transform and per-layer presence levels. The Rig
(`scene/Rig.tsx`) interpolates between them with smoothstep as you scroll, eases the
live values, and writes presence/`heroTarget` for the layers.

Current hero choreography (deliberately quiet — the shrink/return cycle was reduced to
two moments):

| Section | Headset |
|---|---|
| Hero · What is XR · The Skill Lab | **visible** (right third → upper right → behind the spec panel) |
| Curriculum (Nine modules) | hidden — the corridor takes over |
| Labs | hidden |
| Method (Six steps, one loop) | hidden — the cycle ring is the subject |
| Toolchain | hidden |
| Outcomes (What you'll do on your own) | **returns** |
| Join | **visible**, large and front-facing |

Special rigs: the curriculum section pins and slides the **corridor** toward a fixed
camera (`e3`/`x3`/`pin3` in `motion.ts`); the method section pins and drives the cycle
ring's **arc** with `pin5`. On `/register` the rig switches to a dedicated key and the
progress ring fills with `regStep/4`.

Interaction extras: hovering the VR/AR/MR cards re-lights the whole scene
(`store.xrMode`), scroll velocity feeds grid drift / dust flow / ring spin, and the
pointer adds ±0.4-unit camera parallax.

## Hero asset pipeline

`public/models/headset.glb` is the club's own scan (provenance and licence status in
[`public/models/CREDITS.md`](public/models/CREDITS.md) — **confirm the licence before
public redistribution**). The source arrived as a 10.7 MB material-less 592,720-triangle
mesh; the pipeline in `scripts/prepare_owner_model.mjs`:

1. **weld** (topology merge; the full 592,720 triangles are retained at the owner's
   request — pass e.g. `--ratio 0.07 --err 0.05` to simplify instead),
2. assign the near-black charcoal PBR material (the source has none),
3. optional `--rot-deg` bake so the visor faces +Z (currently **no** rotation — the scan
   is natively correct),
4. `@gltf-transform/cli optimize --compress meshopt --simplify false` → 1.79 MB.

`npm run report:model` verifies triangles/materials/bounds. Two budget warnings
(triangles > 60k, size > 1.5 MB) are intentional owner overrides — see
[Known tradeoffs](#known-tradeoffs). `HeroModel.tsx` auto-fits whatever GLB sits at
`public/models/headset.glb` to 2.8 world units, recentres it, and studio-lights it with
a procedural `Environment` (no HDRI download).

## The method loop animation

With the headset absent from the Method section, the six-step loop is the section's 3D
subject (`scene/CycleRing.tsx`):

- a dim base ring carries six step nodes;
- a **bright arc sweeps clockwise** around it, driven continuously by the pinned
  scroll progress (`motion.pin5`) — it is literally the "one loop" filling up;
- each node lights as the arc passes it, and the **active node pops** (scales up,
  brightens) with a **one-shot expanding halo** on every step change;
- the left-hand step list and the 3D arc share the same `pin5` signal, so DOM and scene
  never disagree.

Clicking a step in the list scrolls to that step's exact pin offset.

## Registration & the backend seam

`/register` is a four-step form (You → Campus → Interest → Review) built on
react-hook-form + zod with per-step validation, floating labels (no placeholder text),
choice pills/chips, draft persistence in `sessionStorage` (**never** the consent field),
and per-step focus management.

There is **no backend**, and nothing fakes one. A valid submit shows an honest Done
state ("nothing has been sent") with *Download details (.json)* and *Copy summary*
actions.

**The seam for later:** exactly one function — `onValidSubmit(data)` in
[`src/components/register/RegisterShell.tsx`](src/components/register/RegisterShell.tsx).
Today it clears the draft and flips status to `ready`. When a backend exists, replace
its body with the network call and map `status` to `submitting | sent | error`. Add no
other abstractions.

## Design system & theming

- Tokens, type scale, spacing and components live in [`src/app/globals.css`](src/app/globals.css)
  (`--gutter`, `--section-pad`, `--r-*`, `--ease`, the `[data-theme]` block, `.glass`,
  `.btn`, `.eyebrow`, `.pill`, form fields…).
- Space Grotesk (display), Manrope (body), JetBrains Mono (micro-labels) via
  `next/font` — fluid `clamp()` sizes tuned for a 1440×900 reference viewport.
- **Single dark theme** (`holo`): near-black graphite matched to the black headset,
  cyan `#5EEAFF` accents. The theme object (`src/lib/themes.ts`) feeds both the CSS
  variables and the shader colours; adding a theme = adding an entry (light themes must
  drop additive blending and bloom).
- Brand glyph: `public/brand/visor.svg` (also the favicon at `src/app/icon.svg`).

## Accessibility & performance

- The canvas is `aria-hidden`; **all information lives in the DOM**. Landmarks, skip
  link, one `h1` per page, `aria-current` on stepper/nav, keyboard-operable cards,
  drawer focus trap, visible focus rings.
- `prefers-reduced-motion`: Lenis off, scene time frozen, velocity effects zero, marquee
  and pins fall back to stacked layouts, reveals fade only.
- Quality tiers (high/medium/low) from an FPS probe that skips the first 2.5 s and takes
  the median of ~3 s of frames — never auto-upgrades. `Alt+Shift+Q` cycles tiers;
  `localStorage['arvr-quality']` pre-seeds one.
- Tab hidden → frameloop paused. WebGL unavailable/context lost → CSS-gradient
  fallback, site fully usable. No-JS → content renders; pinned sections fall back to
  stacked layouts (`@media (scripting: none)`).
- First-load JS ≈ 147 kB (home) / 165 kB (register); three.js is outside the initial
  bundle (dynamic import, `ssr:false`).

## Known tradeoffs

- **The headset ships at full resolution (592,720 triangles, 1.79 MB)** at the owner's
  request. Desktop GPUs are fine; low-end phones may drop below the 30 fps target since
  geometry is not tiered. `scripts/prepare_owner_model.mjs --ratio 0.07 --err 0.05`
  regenerates a ~41k-triangle version if that ever matters.
- The licence of the owner-supplied scan is **unconfirmed** — see CREDITS.md.
- Dates (19–20 November 2026) are owner-confirmed; the annexure itself lists none.
- Everything currently in the working tree since commit `254c81f` is **uncommitted**
  by request.
