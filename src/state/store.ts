'use client';

import { create } from 'zustand';

export type QualityTier = 'high' | 'medium' | 'low';
export type XrMode = null | 'vr' | 'ar' | 'mr';
export type Route = 'home' | 'register';

/**
 * Low-frequency state ONLY (plan §2.3.4). Per-frame values live in
 * `lib/motion.ts` and must never be stored here.
 */
interface AppState {
  themeId: 'holo' | 'daylight';
  quality: QualityTier;
  reducedMotion: boolean;
  xrMode: XrMode;
  regStep: number; // 0..3 form steps, 4 = done state
  modelReady: boolean;
  route: Route;
  drawerOpen: boolean;
  activeSection: string | null;

  setTheme: (id: AppState['themeId']) => void;
  setQuality: (q: QualityTier) => void;
  setReducedMotion: (v: boolean) => void;
  setXrMode: (m: XrMode) => void;
  setRegStep: (n: number) => void;
  setModelReady: (v: boolean) => void;
  setRoute: (r: Route) => void;
  setDrawerOpen: (v: boolean) => void;
  setActiveSection: (id: string | null) => void;
}

export const useStore = create<AppState>((set) => ({
  themeId: 'holo',
  quality: 'high',
  reducedMotion: false,
  xrMode: null,
  regStep: 0,
  modelReady: false,
  route: 'home',
  drawerOpen: false,
  activeSection: null,

  setTheme: (themeId) => set({ themeId }),
  setQuality: (quality) => set({ quality }),
  setReducedMotion: (reducedMotion) => set({ reducedMotion }),
  setXrMode: (xrMode) => set({ xrMode }),
  setRegStep: (regStep) => set({ regStep }),
  setModelReady: (modelReady) => set({ modelReady }),
  setRoute: (route) => set({ route }),
  setDrawerOpen: (drawerOpen) => set({ drawerOpen }),
  setActiveSection: (activeSection) => set({ activeSection }),
}));
