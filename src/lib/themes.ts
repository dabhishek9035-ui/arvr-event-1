export type Theme = {
  id: 'holo' | 'daylight';
  label: string;
  mode: 'dark' | 'light';
  scene: {
    bg: string; c1: string; c2: string; c3: string; particle: string;
    additive: boolean; bloom: number; warp: number; rim: string;
  };
};

export const THEMES: Theme[] = [
  {
    id: 'holo', label: 'Holo', mode: 'dark',
    scene: {
      bg: '#04050D', c1: '#0B0F33', c2: '#3B30C9', c3: '#7DF3FF', particle: '#9FEFFF',
      additive: true, bloom: 0.7, warp: 0.5, rim: '#5EEAFF',
    },
  },
  {
    id: 'daylight', label: 'Daylight', mode: 'light',
    scene: {
      bg: '#F3F6FB', c1: '#DCE4FA', c2: '#9AA6F5', c3: '#FFFFFF', particle: '#4A3CF0',
      additive: false, bloom: 0, warp: 0.3, rim: '#4A3CF0',
    },
  },
];

export function getTheme(id: string): Theme {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}
