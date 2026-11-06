'use client';

import { useEffect, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useThree } from '@react-three/fiber';
import Scene from './Scene';
import { useQualityProbe } from '@/hooks/useQualityProbe';
import { useStore } from '@/state/store';

function glSupported(): boolean {
  try {
    const c = document.createElement('canvas');
    return Boolean(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

function CanvasEvents({ onLost, onRestored }: { onLost: () => void; onRestored: () => void }) {
  const gl = useThree((s) => s.gl);
  useEffect(() => {
    const el = gl.domElement;
    const lost = (e: Event) => {
      e.preventDefault();
      onLost();
    };
    el.addEventListener('webglcontextlost', lost);
    el.addEventListener('webglcontextrestored', onRestored);
    return () => {
      el.removeEventListener('webglcontextlost', lost);
      el.removeEventListener('webglcontextrestored', onRestored);
    };
  }, [gl, onLost, onRestored]);
  return null;
}

function Probe() {
  useQualityProbe();
  return null;
}

/** Plan §6.2 — canvas configuration, WebGL check, visibility pause, context loss. */
export default function SceneCanvas() {
  const [supported] = useState(glSupported);
  const [visible, setVisible] = useState(true);
  const [lost, setLost] = useState(false);
  const quality = useStore((s) => s.quality);

  useEffect(() => {
    const onVis = () => setVisible(document.visibilityState === 'visible');
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  if (!supported) return null; // CSS gradient fallback in globals.css shows instead

  const active = visible && !lost;

  return (
    <div className="scene-root" data-lost={active ? undefined : 'true'} aria-hidden="true">
      <Canvas
        dpr={quality === 'high' ? [1, 1.75] : quality === 'medium' ? [1, 1.5] : [1, 1]}
        camera={{ fov: 35, near: 0.1, far: 120, position: [0, 0.2, 7.5] }}
        gl={{
          antialias: false,
          powerPreference: 'high-performance',
          alpha: false,
          toneMapping: THREE.NeutralToneMapping,
        }}
        frameloop={active ? 'always' : 'never'}
        shadows={false}
        style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}
      >
        <CanvasEvents onLost={() => setLost(true)} onRestored={() => setLost(false)} />
        <Scene />
        <Probe />
      </Canvas>
    </div>
  );
}
