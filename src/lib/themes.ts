export type Theme = {
  id: 'holo';
  label: string;
  mode: 'dark';
  scene: {
    bg: string; c1: string; c2: string; c3: string; accent2: string; particle: string;
    additive: boolean; bloom: number; warp: number; rim: string;
  };
};

/**
 * Single dark theme — matched to the ARVR-Hub reference: near-black space with
 * the purple family (#9333ea primary, #b48cde lavender, royal #5c33cc support).
 * The black headset reads through lavender rim light; rings, grid, nebula and
 * particles all carry the reference's purple identity.
 */
export const THEMES: Theme[] = [
  {
    id: 'holo', label: 'Hub', mode: 'dark',
    scene: {
      bg: '#0a0a0a', c1: '#0d0b14', c2: '#2b1550', c3: '#9333ea', accent2: '#5c33cc', particle: '#b48cde',
      additive: true, bloom: 0.55, warp: 0.45, rim: '#b48cde',
    },
  },
];

export function getTheme(id: string): Theme {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}
