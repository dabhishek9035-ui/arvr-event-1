import * as THREE from 'three';
import { THEMES, getTheme } from './themes';
import { damp } from './motion';

export interface ThemeColors {
  bg: THREE.Color;
  c1: THREE.Color;
  c2: THREE.Color;
  c3: THREE.Color;
  particle: THREE.Color;
  rim: THREE.Color;
  accent: THREE.Color;
  accent2: THREE.Color;
}

type Key = keyof ThemeColors;

function fromTheme(id: string): ThemeColors {
  const t = getTheme(id).scene;
  // THREE.ColorManagement (enabled by default in r170) converts sRGB hex to
  // the linear working space, so shaders stay linear until the FINISH chunk.
  return {
    bg: new THREE.Color(t.bg),
    c1: new THREE.Color(t.c1),
    c2: new THREE.Color(t.c2),
    c3: new THREE.Color(t.c3),
    particle: new THREE.Color(t.particle),
    rim: new THREE.Color(t.rim),
    accent: new THREE.Color(t.c3),
    accent2: new THREE.Color(t.c2),
  };
}

/**
 * Singleton colours shared with shader uniforms BY REFERENCE and eased toward
 * the active theme every frame (plan §2.3.7). scene.background / fog.color
 * point at themeColors.bg, so a mutation updates the whole scene.
 */
export const themeColors: ThemeColors = fromTheme('holo');

let targets: ThemeColors = fromTheme('holo');
let syncedId = 'holo';

/** Point the easing targets at a theme. Cheap; safe to call on every change. */
export function syncThemeTarget(id: string) {
  if (id === syncedId) return;
  syncedId = id;
  targets = fromTheme(id);
}

const SPEED = 3;

/** Ease every singleton toward its target. Called once per frame from Scene. */
export function updateThemeColors(dt: number) {
  const k = 1 - Math.exp(-Math.min(dt, 0.05) * SPEED);
  if (k >= 1) {
    for (const key of Object.keys(targets) as Key[]) themeColors[key].copy(targets[key]);
    return;
  }
  for (const key of Object.keys(targets) as Key[]) themeColors[key].lerp(targets[key], k);
}

/** True while colours are still visibly easing (for UI hints if ever needed). */
export function themeSettled(): boolean {
  return syncedId === THEMES[0].id || syncedId === THEMES[1].id;
}
