'use client';

import { THEMES } from '@/lib/themes';
import { useStore } from '@/state/store';

/** Two theme swatches (§5.4). Writes localStorage + store + html[data-theme]. */
export default function ThemeSwitcher() {
  const themeId = useStore((s) => s.themeId);
  const setTheme = useStore((s) => s.setTheme);

  return (
    <div className="theme-switcher" role="group" aria-label="Theme">
      {THEMES.map((t) => (
        <button
          key={t.id}
          type="button"
          className={`theme-swatch${themeId === t.id ? ' active' : ''}`}
          aria-pressed={themeId === t.id}
          title={`${t.label} theme`}
          onClick={() => {
            setTheme(t.id);
            document.documentElement.dataset.theme = t.id;
            try {
              localStorage.setItem('arvr-theme', t.id);
            } catch {
              /* storage unavailable */
            }
          }}
        >
          <span
            className="swatch-fill"
            style={{ background: `linear-gradient(135deg, ${t.scene.c2}, ${t.scene.c3})` }}
            aria-hidden="true"
          />
          <span className="visually-hidden">{t.label} theme</span>
        </button>
      ))}
    </div>
  );
}
