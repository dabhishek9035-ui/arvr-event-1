'use client';

/** Home section ids, in scroll order (plan §3). */
export const SECTION_IDS = [
  'top', 'xr', 'skill-lab', 'curriculum', 'labs',
  'method', 'toolchain', 'outcomes', 'join',
] as const;

export interface SectionRect {
  top: number;
  height: number;
  /** Rect the pin progress is derived from (method uses its .method-pin child). */
  pinTop: number;
  pinHeight: number;
}

/** Layout offsets (not per-frame getBoundingClientRect); re-measured on resize/fonts. */
export function measureSections(): SectionRect[] {
  const rects: SectionRect[] = [];
  for (const id of SECTION_IDS) {
    const el = document.getElementById(id);
    if (!el) {
      rects.push({ top: 0, height: 1, pinTop: 0, pinHeight: 1 });
      continue;
    }
    const r = el.getBoundingClientRect();
    const top = r.top + window.scrollY;
    const height = Math.max(1, r.height);
    // The method section's pin progress is driven by its inner wrapper (§9.6);
    // the XR design panel after the pin is normal flow and must not extend it.
    const pinEl = el.querySelector<HTMLElement>('.method-pin');
    if (pinEl) {
      const pr = pinEl.getBoundingClientRect();
      rects.push({ top, height, pinTop: pr.top + window.scrollY, pinHeight: Math.max(1, pr.height) });
    } else {
      rects.push({ top, height, pinTop: top, pinHeight: height });
    }
  }
  return rects;
}

export interface SectionState {
  index: number;
  sf: number;
  pin3: number;
  e3: number;
  x3: number;
  pin5: number;
  tSkill: number;
  activeId: string;
}

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

/**
 * sf = index + t of the section containing the viewport vertical centre (§7.3).
 * pin3/pin5 use (scrollY − pinTop) / (pinHeight − 100vh) — the sticky-pin progress.
 * e3/x3 are the curriculum corridor's entry/exit progress (§6.4.2).
 */
export function computeSectionState(y: number, vh: number, rects: SectionRect[]): SectionState {
  const centre = y + vh / 2;
  let index = 0;
  for (let i = 0; i < rects.length; i++) {
    if (centre >= rects[i].top) index = i;
  }
  const r = rects[index] ?? { top: 0, height: 1, pinTop: 0, pinHeight: 1 };
  const sf = index + clamp01((centre - r.top) / r.height);

  const c = rects[3] ?? r;
  const travel3 = Math.max(1, c.pinHeight - vh);
  const pin3 = clamp01((y - c.pinTop) / travel3);
  const e3 = clamp01((y + vh - c.top) / vh);
  const x3 = clamp01((y - (c.top + c.height - vh)) / vh);

  const m = rects[5] ?? r;
  const travel5 = Math.max(1, m.pinHeight - vh);
  const pin5 = clamp01((y - m.pinTop) / travel5);

  const s = rects[2] ?? r;
  const tSkill = clamp01((centre - s.top) / s.height);

  return { index, sf, pin3, e3, x3, pin5, tSkill, activeId: SECTION_IDS[index] ?? 'top' };
}
