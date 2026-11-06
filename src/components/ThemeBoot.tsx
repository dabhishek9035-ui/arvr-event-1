'use client';

import { useEffect } from 'react';
import { useStore } from '@/state/store';

/**
 * Syncs the persisted theme into the store on mount (the inline boot script
 * only sets the CSS attribute before paint — the scene + switcher need the
 * store value too).
 */
export default function ThemeBoot() {
  useEffect(() => {
    try {
      const t = localStorage.getItem('arvr-theme');
      if ((t === 'holo' || t === 'daylight') && useStore.getState().themeId !== t) {
        useStore.getState().setTheme(t);
      }
    } catch {
      /* storage unavailable */
    }
  }, []);
  return null;
}
