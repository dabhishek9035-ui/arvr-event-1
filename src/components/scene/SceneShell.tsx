'use client';

import dynamic from 'next/dynamic';

/** Client-only mount of the ONE persistent canvas (plan §2.3.1). */
const SceneCanvas = dynamic(() => import('./SceneCanvas'), { ssr: false });

export default function SceneShell() {
  return <SceneCanvas />;
}
