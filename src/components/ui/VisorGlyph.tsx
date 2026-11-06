'use client';

import { useId } from 'react';

/** Brand visor glyph (plan §8.1). 32×32 viewBox, currentColor stroke. */
export default function VisorGlyph({ size = 32 }: { size?: number }) {
  const id = useId();
  const gid = `vg-${id.replace(/[^a-zA-Z0-9-]/g, '')}`;
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <rect x="3" y="9" width="26" height="14" rx="6" stroke="currentColor" strokeWidth="1.75" />
      <circle cx="11" cy="16" r="3.2" fill={`url(#${gid})`} />
      <circle cx="21" cy="16" r="3.2" fill={`url(#${gid})`} />
      <path d="M13 23 q3 3 6 0" stroke="currentColor" strokeWidth="1.75" fill="none" strokeLinecap="round" />
      <defs>
        <linearGradient id={gid} x1="8" y1="12" x2="24" y2="20" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--accent)" />
          <stop offset="1" stopColor="var(--accent-2)" />
        </linearGradient>
      </defs>
    </svg>
  );
}
