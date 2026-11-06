/**
 * Scene keyframes (plan §6.4.1). Desktop values, world units.
 * hero 's' scales a model auto-fitted to 2.4 units on its longest side.
 * Keyframes sit at section centres (`at = i + 0.5`).
 */

export type V3 = [number, number, number];

export interface LayerLevels {
  stars: number;
  grid: number;
  rings: number;
  dial: number;
  corr: number;
  panels: number;
  cycle: number;
  dust: number;
  progress: number;
}

export interface Keyframe {
  at: number;
  cam: V3;
  look: V3;
  hero: { p: V3; r: V3; s: number; pr: number };
  L: LayerLevels;
}

const L = (o: Partial<LayerLevels>): LayerLevels => ({
  stars: 1, grid: 0, rings: 0, dial: 0, corr: 0, panels: 0, cycle: 0, dust: 1, progress: 0, ...o,
});

// 0 hero · 1 xr · 2 skill-lab · (3 curriculum → corridor rig §6.4.2) · 4 labs · 5 method · 6 toolchain · 7 outcomes · 8 join
export const KEYS: Keyframe[] = [
  {
    at: 0.5, cam: [0, 0.2, 7.5], look: [0.8, 0, 0],
    hero: { p: [2.0, 0.1, 0], r: [0.08, -0.5, 0], s: 1.0, pr: 1 },
    L: L({ grid: 0.35, rings: 1.0 }),
  },
  {
    at: 1.5, cam: [0, 0.3, 8.2], look: [0, 0.2, 0],
    hero: { p: [3.1, 1.25, -1.6], r: [0, -0.25, 0], s: 0.7, pr: 1 },
    L: L({ grid: 0.8, rings: 0.5 }),
  },
  {
    at: 2.5, cam: [0, 0, 8.0], look: [0, 0, 0],
    hero: { p: [3.0, 0.0, -2.4], r: [0.1, 0.9, 0], s: 1.15, pr: 1 },
    L: L({ grid: 0.4, rings: 0.3, dial: 1 }),
  },
  {
    at: 4.5, cam: [0, 0, 8.0], look: [0, 0, 0],
    hero: { p: [0, 0, -3], r: [0, 0, 0], s: 0.0, pr: 0 },
    L: L({ grid: 0.6, panels: 1 }),
  },
  {
    at: 5.5, cam: [0, 0, 8.0], look: [1.0, 0, 0],
    hero: { p: [2.4, -0.1, 0], r: [0.05, 0, 0], s: 0.75, pr: 1 },
    L: L({ grid: 0.25, rings: 0.4, cycle: 1 }),
  },
  {
    at: 6.5, cam: [0, 0.1, 9.0], look: [0, 0, 0],
    hero: { p: [0, 0, -4], r: [0, 0, 0], s: 0.0, pr: 0 },
    L: L({ grid: 0.5, panels: 0.35 }),
  },
  {
    at: 7.5, cam: [0, 0.2, 8.0], look: [0.5, 0, 0],
    hero: { p: [3.0, -0.3, -1.2], r: [0.05, -0.7, 0], s: 0.9, pr: 1 },
    L: L({ grid: 0.35, rings: 0.5 }),
  },
  {
    at: 8.5, cam: [0, 0.0, 6.5], look: [0, 0.9, 0],
    hero: { p: [0, 1.2, 0], r: [0, 0, 0], s: 1.3, pr: 1 },
    L: L({ grid: 0.7, rings: 1.2 }),
  },
];

/** /register (plan §10.2). */
export const REGISTER_KEY: Keyframe = {
  at: 0, cam: [0, 0.1, 6.5], look: [-1.4, 0, 0],
  hero: { p: [-2.3, 0, 0], r: [0.05, 0.5, 0], s: 1.1, pr: 1 },
  L: L({ grid: 0.3, rings: 1, progress: 1 }),
};

/** Reusable interpolation output (no per-frame allocations). */
export const WORK: Keyframe = {
  at: 0, cam: [0, 0, 0], look: [0, 0, 0],
  hero: { p: [0, 0, 0], r: [0, 0, 0], s: 1, pr: 1 },
  L: L({}),
};

const smooth01 = (x: number) => {
  const t = x < 0 ? 0 : x > 1 ? 1 : x;
  return t * t * (3 - 2 * t);
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function copyKey(src: Keyframe, out: Keyframe) {
  out.at = src.at;
  for (let i = 0; i < 3; i++) {
    out.cam[i] = src.cam[i];
    out.look[i] = src.look[i];
    out.hero.p[i] = src.hero.p[i];
    out.hero.r[i] = src.hero.r[i];
  }
  out.hero.s = src.hero.s;
  out.hero.pr = src.hero.pr;
  const keys = Object.keys(src.L) as (keyof LayerLevels)[];
  for (const k of keys) out.L[k] = src.L[k];
}

/** Interpolate every number between neighbouring keyframes with smoothstep. */
export function sampleKeysInto(sf: number, out: Keyframe): Keyframe {
  const first = KEYS[0];
  const last = KEYS[KEYS.length - 1];
  if (sf <= first.at) { copyKey(first, out); return out; }
  if (sf >= last.at) { copyKey(last, out); return out; }
  for (let i = 0; i < KEYS.length - 1; i++) {
    const a = KEYS[i];
    const b = KEYS[i + 1];
    if (sf >= a.at && sf <= b.at) {
      const t = smooth01((sf - a.at) / (b.at - a.at));
      for (let j = 0; j < 3; j++) {
        out.cam[j] = lerp(a.cam[j], b.cam[j], t);
        out.look[j] = lerp(a.look[j], b.look[j], t);
        out.hero.p[j] = lerp(a.hero.p[j], b.hero.p[j], t);
        out.hero.r[j] = lerp(a.hero.r[j], b.hero.r[j], t);
      }
      out.hero.s = lerp(a.hero.s, b.hero.s, t);
      out.hero.pr = lerp(a.hero.pr, b.hero.pr, t);
      const keys = Object.keys(a.L) as (keyof LayerLevels)[];
      for (const k of keys) out.L[k] = lerp(a.L[k], b.L[k], t);
      return out;
    }
  }
  copyKey(last, out);
  return out;
}
