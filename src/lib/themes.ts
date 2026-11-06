export type Theme = {
  id: 'holo';
  label: string;
  mode: 'dark';
  scene: {
    bg: string; c1: string; c2: string; c3: string; particle: string;
    additive: boolean; bloom: number; warp: number; rim: string;
  };
};

/**
 * Single dark theme. Near-black graphite tones matched to the black headset:
 * c1/c2 keep just enough indigo to read as space; c3 is the cyan accent shared
 * by the rings, grid and rim light (what keeps a black object legible).
 */
export const THEMES: Theme[] = [
  {
    id: 'holo', label: 'Holo', mode: 'dark',
    scene: {
      bg: '#030409', c1: '#05060D', c2: '#10142B', c3: '#59D8F2', particle: '#6FA8B8',
      additive: true, bloom: 0.7, warp: 0.5, rim: '#5EEAFF',
    },
  },
];

export function getTheme(id: string): Theme {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}
