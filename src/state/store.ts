'use client';

import { create } from 'zustand';

export type QualityTier = 'high' | 'medium' | 'low';
export type XrMode = null | 'vr' | 'ar' | 'mr';
export type Route = 'home' | 'register';

export interface RegistrationStats {
  count: number;
  cap: number;
  remaining: number;
  isClosed: boolean;
  shortlistCount: number;
  dbReady: boolean;
}

/**
 * Low-frequency state ONLY (plan §2.3.4). Per-frame values live in
 * `lib/motion.ts` and must never be stored here.
 */
interface AppState {
  themeId: 'holo';
  quality: QualityTier;
  reducedMotion: boolean;
  xrMode: XrMode;
  regStep: number; // 0..3 form steps, 4 = done state
  modelReady: boolean;
  route: Route;
  drawerOpen: boolean;
  activeSection: string | null;
  registrationStats: RegistrationStats | null;

  setTheme: (id: AppState['themeId']) => void;
  setQuality: (q: QualityTier) => void;
  setReducedMotion: (v: boolean) => void;
  setXrMode: (m: XrMode) => void;
  setRegStep: (n: number) => void;
  setModelReady: (v: boolean) => void;
  setRoute: (r: Route) => void;
  setDrawerOpen: (v: boolean) => void;
  setActiveSection: (id: string | null) => void;
  setRegistrationStats: (stats: RegistrationStats | null) => void;
  incrementRegistrationCount: (newCount?: number) => void;
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
  registrationStats: null,

  setTheme: (themeId) => set({ themeId }),
  setQuality: (quality) => set({ quality }),
  setReducedMotion: (reducedMotion) => set({ reducedMotion }),
  setXrMode: (xrMode) => set({ xrMode }),
  setRegStep: (regStep) => set({ regStep }),
  setModelReady: (modelReady) => set({ modelReady }),
  setRoute: (route) => set({ route }),
  setDrawerOpen: (drawerOpen) => set({ drawerOpen }),
  setActiveSection: (activeSection) => set({ activeSection }),
  setRegistrationStats: (registrationStats) => set({ registrationStats }),
  incrementRegistrationCount: (newCount) =>
    set((prev) => {
      const cap = prev.registrationStats?.cap ?? 100;
      const count =
        typeof newCount === 'number'
          ? newCount
          : (prev.registrationStats?.count ?? 0) + 1;
      const remaining = Math.max(0, cap - count);
      return {
        registrationStats: {
          count,
          cap,
          remaining,
          isClosed: count >= cap,
          shortlistCount: prev.registrationStats?.shortlistCount ?? 40,
          dbReady: true,
        },
      };
    }),
}));
