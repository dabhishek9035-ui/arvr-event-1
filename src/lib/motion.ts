/**
 * Mutable per-frame store (plan §7.2). Read inside useFrame / rAF loops.
 * NEVER put these values in React state or zustand.
 */
export const motion = {
  progress: 0,   // 0..1 over the whole home page
  velocity: 0,   // px/ms * 0.48, clamped 0..3.2, decays *0.9 per frame when idle
  mx: 0, my: 0,  // pointer -1..1 (raw; smoothed inside the rig)
  sf: 0,         // section float (index + t)
  pin3: 0, pin5: 0, // pinned progress 0..1 (curriculum / method)
  e3: 0, x3: 0,  // curriculum entry/exit progress
  tSkill: 0,     // t inside section 2 (drives the dial)
};

export type PresenceKey =
  | 'stars' | 'grid' | 'rings' | 'dial' | 'corr'
  | 'panels' | 'cycle' | 'dust' | 'hero' | 'progress';

/** Targets written by the Rig each frame (raw keyframe levels). */
export const presenceT: Record<PresenceKey, number> = {
  stars: 1, grid: 0.35, rings: 1, dial: 0, corr: 0,
  panels: 0, cycle: 0, dust: 1, hero: 1, progress: 0,
};

/** Live eased presence values read by each layer. */
export const presence: Record<PresenceKey, number> = {
  stars: 1, grid: 0.35, rings: 1, dial: 0, corr: 0,
  panels: 0, cycle: 0, dust: 1, hero: 1, progress: 0,
};

/** XR-mode / register effects (§6.6, §10.2). Eased by the Rig. */
export const fx = {
  bright: 1, warpMul: 1, gridMul: 1, ringsMul: 1, starsMul: 1,
  heroScaleMul: 1, ringTilt: 0, rimBoost: 1,
};
export const fxT = { ...fx };

/** Hero transform target, written by the Rig, applied by HeroModel. */
export const heroTarget = {
  px: 0, py: 0, pz: 0,
  rx: 0, ry: 0, rz: 0,
  s: 1, pr: 1,
};

/** Cross-component scene refs (minimal structural types; no three import). */
import type { Object3D } from 'three';
export const sceneRefs: { heroGroup: Object3D | null } = { heroGroup: null };

/** Frame-rate independent exponential smoothing (plan §2.3.6). */
export function damp(cur: number, target: number, dt: number, speed: number): number {
  const k = 1 - Math.exp(-Math.min(dt, 0.05) * speed);
  return cur + (target - cur) * k;
}

export function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

/** Correct-order smoothstep — never smoothstep(hi, lo, x). */
export function smooth(lo: number, hi: number, x: number): number {
  const t = clamp01((x - lo) / (hi - lo));
  return t * t * (3 - 2 * t);
}
