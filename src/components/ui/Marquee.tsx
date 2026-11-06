'use client';

import type { TechItem } from '@/content/skillLab';

interface MarqueeProps {
  items: TechItem[];
  duration: number;
  reverse?: boolean;
}

/** Full-bleed marquee row (§9.7). List rendered twice for a seamless loop. */
export default function Marquee({ items, duration, reverse = false }: MarqueeProps) {
  return (
    <div
      className={`marquee${reverse ? ' marquee-reverse' : ''}`}
      style={{ '--dur': `${duration}s` } as React.CSSProperties}
    >
      <div className="marquee-track">
        {[0, 1].map((copy) => (
          <div className="marquee-group" key={copy} aria-hidden={copy === 1 || undefined}>
            {items.map((item) => (
              <div className="marquee-chip glass" key={`${copy}-${item.name}`}>
                <span className="marquee-name">{item.name}</span>
                <span className="marquee-role">{item.role}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
