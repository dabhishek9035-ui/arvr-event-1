'use client';

import { useEffect, useState } from 'react';
import { useProgress } from '@react-three/drei';

/** 2 px accent line under the header showing GLB load progress (§5.1). */
export default function LoadBar() {
  const { progress, active } = useProgress();
  const [faded, setFaded] = useState(false);

  useEffect(() => {
    if (progress >= 100 && !active) {
      const t = setTimeout(() => setFaded(true), 400);
      return () => clearTimeout(t);
    }
    setFaded(false);
  }, [progress, active]);

  if (faded) return null;
  const width = active || progress > 0 ? Math.min(100, progress) : 0;
  if (width === 0) return null;
  return <div className="loadbar" style={{ width: `${width}%` }} aria-hidden="true" />;
}
