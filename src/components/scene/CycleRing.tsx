'use client';

import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { presence, motion, damp, sceneRefs } from '@/lib/motion';
import { themeColors } from '@/lib/useThemeColors';
import { getTheme } from '@/lib/themes';
import { useStore } from '@/state/store';

/**
 * L8 Cycle ring (plan §6.3 + §6.4.3): six nodes on a radius-2.2 ring around
 * the hero; rotates one sixth of a turn per method step (pin5).
 */

const NODES = 6;
const R = 2.2;
const TAU = Math.PI * 2;

export default function CycleRing() {
  const themeId = useStore((s) => s.themeId);
  const reduced = useStore((s) => s.reducedMotion);
  const group = useRef<THREE.Group>(null);
  const nodeRefs = useRef<(THREE.Mesh | null)[]>([]);
  const nodeScales = useRef<number[]>(new Array(NODES).fill(1));

  const ringMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: themeColors.accent2,
        transparent: true,
        opacity: 0.8,
        depthWrite: false,
      }),
    [],
  );
  const connectorMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: themeColors.accent2,
        transparent: true,
        opacity: 0.4,
        depthWrite: false,
      }),
    [],
  );
  const nodeMaterials = useMemo(
    () =>
      Array.from(
        { length: NODES },
        () =>
          new THREE.MeshBasicMaterial({
            color: themeColors.c3,
            transparent: true,
            opacity: 0.5,
            depthWrite: false,
          }),
      ),
    [],
  );

  useEffect(() => {
    const dark = getTheme(themeId).mode === 'dark';
    const blending = dark ? THREE.AdditiveBlending : THREE.NormalBlending;
    ringMaterial.blending = blending;
    connectorMaterial.blending = blending;
    for (const m of nodeMaterials) {
      m.blending = blending;
      m.needsUpdate = true;
    }
    ringMaterial.needsUpdate = true;
    connectorMaterial.needsUpdate = true;
  }, [themeId, ringMaterial, connectorMaterial, nodeMaterials]);

  const nodeAngles = useMemo(
    () => Array.from({ length: NODES }, (_, i) => (i / NODES) * TAU),
    [],
  );
  const midAngles = useMemo(
    () => Array.from({ length: NODES }, (_, i) => ((i + 0.5) / NODES) * TAU),
    [],
  );

  useFrame((_, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05);
    const g = group.current;
    if (!g) return;
    const p = presence.cycle;
    g.visible = p > 0.01;
    if (!g.visible) return;

    const hero = sceneRefs.heroGroup;
    if (hero) g.position.copy(hero.position);

    const step = Math.min(NODES - 1, Math.max(0, Math.floor(motion.pin5 * NODES)));
    const targetRot = reduced ? 0 : -step * ((TAU / NODES) as number);
    g.rotation.z = damp(g.rotation.z, targetRot, dt, 4);

    ringMaterial.opacity = 0.8 * p;
    connectorMaterial.opacity = 0.4 * p;

    for (let i = 0; i < NODES; i++) {
      const node = nodeRefs.current[i];
      if (!node) continue;
      const active = i === step;
      const target = active ? 0.16 / 0.09 : 1;
      nodeScales.current[i] = damp(nodeScales.current[i], target, dt, 8);
      node.scale.setScalar(nodeScales.current[i]);
      const m = node.material as THREE.MeshBasicMaterial;
      m.opacity = (active ? 1 : 0.5) * p;
    }
  });

  return (
    <group ref={group} visible={false}>
      <mesh material={ringMaterial}>
        <torusGeometry args={[R, 0.015, 8, 128]} />
      </mesh>
      {nodeAngles.map((a, i) => (
        <mesh
          key={`n-${i}`}
          ref={(el) => {
            nodeRefs.current[i] = el;
          }}
          material={nodeMaterials[i]}
          position={[Math.cos(a) * R, Math.sin(a) * R, 0]}
        >
          <sphereGeometry args={[0.09, 16, 16]} />
        </mesh>
      ))}
      {midAngles.map((a, i) => (
        <mesh
          key={`c-${i}`}
          material={connectorMaterial}
          position={[Math.cos(a) * R, Math.sin(a) * R, 0]}
          rotation={[0, 0, a + Math.PI / 2]}
        >
          <boxGeometry args={[0.3, 0.016, 0.016]} />
        </mesh>
      ))}
    </group>
  );
}
