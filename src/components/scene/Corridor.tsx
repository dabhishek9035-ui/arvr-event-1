'use client';

import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { presence, motion, clamp01 } from '@/lib/motion';
import { themeColors } from '@/lib/useThemeColors';
import { getTheme } from '@/lib/themes';
import { useStore } from '@/state/store';

/**
 * L6 Corridor (plan §6.3 + §6.4.2): nine octagonal gates the camera flies
 * through during the pinned curriculum section. The GROUP slides; the camera
 * stays. Gate i sits 3 units ahead of the camera when pin3 = i/8.
 */

const GATES = 9;

export default function Corridor() {
  const themeId = useStore((s) => s.themeId);
  const group = useRef<THREE.Group>(null);
  const gateRefs = useRef<(THREE.Mesh | null)[]>([]);
  const railRefs = useRef<(THREE.Mesh | null)[]>([]);
  const lastActive = useRef(-1);
  const scales = useRef<number[]>(new Array(GATES).fill(1));

  const gateMaterials = useMemo(
    () =>
      Array.from(
        { length: GATES },
        () =>
          new THREE.MeshBasicMaterial({
            color: themeColors.accent2,
            transparent: true,
            opacity: 0.35,
            depthWrite: false,
          }),
      ),
    [],
  );
  const railMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: themeColors.accent,
        transparent: true,
        opacity: 0,
        depthWrite: false,
      }),
    [],
  );

  useEffect(() => {
    const dark = getTheme(themeId).mode === 'dark';
    const blending = dark ? THREE.AdditiveBlending : THREE.NormalBlending;
    for (const m of gateMaterials) {
      m.blending = blending;
      m.needsUpdate = true;
    }
    railMaterial.blending = blending;
    railMaterial.needsUpdate = true;
  }, [themeId, gateMaterials, railMaterial]);

  useFrame((_, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05);
    const g = group.current;
    if (!g) return;
    const e = presence.corr;
    g.visible = e > 0.01;
    if (!g.visible) return;

    g.position.z = 11 + 48 * motion.pin3;

    const active = Math.min(GATES - 1, Math.max(0, Math.round(motion.pin3 * (GATES - 1))));
    for (let i = 0; i < GATES; i++) {
      const gate = gateRefs.current[i];
      if (!gate) continue;
      const m = gate.material as THREE.MeshBasicMaterial;
      if (i === active) {
        if (lastActive.current !== active) m.color = themeColors.accent;
        m.opacity = 1 * e;
      } else {
        if (lastActive.current !== active) m.color = themeColors.accent2;
        m.opacity = 0.35 * e;
      }
      const target = i === active ? 1.04 : 1;
      scales.current[i] += (target - scales.current[i]) * (1 - Math.exp(-dt * 10));
      gate.scale.setScalar(scales.current[i]);
    }
    lastActive.current = active;

    railMaterial.opacity = 0.25 * e;
  });

  const gatePositions = useMemo(
    () => Array.from({ length: GATES }, (_, i) => -6 - 6 * i),
    [],
  );
  const rails = useMemo(
    () => [
      [-2.2, 2.2],
      [2.2, 2.2],
      [-2.2, -2.2],
      [2.2, -2.2],
    ],
    [],
  );

  return (
    <group ref={group} visible={false}>
      {gatePositions.map((z, i) => (
        <mesh
          key={i}
          ref={(el) => {
            gateRefs.current[i] = el;
          }}
          material={gateMaterials[i]}
          position={[0, 0, z]}
        >
          <torusGeometry args={[2.6, 0.03, 6, 8]} />
        </mesh>
      ))}
      {rails.map(([x, y], i) => (
        <mesh
          key={`rail-${i}`}
          ref={(el) => {
            railRefs.current[i] = el;
          }}
          material={railMaterial}
          position={[x, y, -30]}
        >
          <boxGeometry args={[0.02, 0.02, 70]} />
        </mesh>
      ))}
    </group>
  );
}
