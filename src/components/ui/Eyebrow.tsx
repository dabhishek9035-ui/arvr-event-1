import type { ReactNode } from 'react';

/** Mono micro label with an accent rule: `── 02 / THE SKILL LAB` (§4.5). */
export default function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="eyebrow">{children}</p>;
}
