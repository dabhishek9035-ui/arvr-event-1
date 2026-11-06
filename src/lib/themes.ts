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
 * Single dark theme. c1/c2 are graphite-indigo tones chosen to blend with the
 * headset's dark grey scan material; c3 is the cyan accent shared by the rings,
 * grid and rim light.
 */
export const THEMES: Theme[] = [
  {
    id: 'holo', label: 'Holo', mode: 'dark',
    scene: {
      bg: '#04050D', c1: '#0A0E24', c2: '#232A66', c3: '#6BE8FF', particle: '#8FD8E8',
      additive: true, bloom: 0.7, warp: 0.5, rim: '#5EEAFF',
    },
  },
];

export function getTheme(id: string): Theme {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}
