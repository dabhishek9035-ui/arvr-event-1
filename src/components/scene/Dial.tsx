'use client';

import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { presence, motion, sceneRefs, clamp01 } from '@/lib/motion';
import { themeColors } from '@/lib/useThemeColors';
import { useStore } from '@/state/store';

/**
 * L5 Dial (plan §6.3): 12 ticks on a radius-2.6 circle around the hero.
 * Tick i lights when sectionT(skill-lab) ≥ i/12. Billboarded to the camera.
 */

const R = 2.6;
const TICKS = 12;

export default function Dial() {
  const reduced = useStore((s) => s.reducedMotion);
  const group = useRef<THREE.Group>(null);
  const instRef = useRef<THREE.InstancedMesh>(null);
  const lastLit = useRef(-1);
  const tmpColor = useMemo(() => new THREE.Color(), []);
  const tmpMat = useMemo(() => new THREE.Matrix4(), []);
  const quat = useMemo(() => new THREE.Quaternion(), []);
  const pos = useMemo(() => new THREE.Vector3(), []);
  const scale = useMemo(() => new THREE.Vector3(1, 1, 1), []);

  const tickMaterial = useMemo(
    () => new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 }),
    [],
  );
  const ringMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: themeColors.accent2,
        transparent: true,
        opacity: 0,
      }),
    [],
  );

  // initialise per-instance colours (dim)
  useEffect(() => {
    const inst = instRef.current;
    if (!inst) return;
    tmpColor.copy(themeColors.accent).multiplyScalar(0.15);
    for (let i = 0; i < TICKS; i++) inst.setColorAt(i, tmpColor);
    if (inst.instanceColor) inst.instanceColor.needsUpdate = true;
    lastLit.current = -1;
  }, [tmpColor]);

  useFrame((state) => {
    const g = group.current;
    if (!g) return;
    const p = presence.dial;
    g.visible = p > 0.01;
    if (!g.visible) return;

    const hero = sceneRefs.heroGroup;
    if (hero) g.position.copy(hero.position);
    g.quaternion.copy(state.camera.quaternion);
    g.scale.setScalar(window.innerWidth < 760 ? 0.7 : 1);

    tickMaterial.opacity = p;
    ringMaterial.opacity = p * 0.5;

    const lit = Math.floor(clamp01(motion.tSkill) * TICKS);
    if (lit !== lastLit.current) {
      const inst = instRef.current;
      if (inst) {
        for (let i = 0; i < TICKS; i++) {
          tmpColor.copy(themeColors.accent).multiplyScalar(i < lit ? 1 : 0.15);
          inst.setColorAt(i, tmpColor);
        }
        if (inst.instanceColor) inst.instanceColor.needsUpdate = true;
      }
      lastLit.current = lit;
    }
  });

  const angles = useMemo(
    () => Array.from({ length: TICKS }, (_, i) => (i / TICKS) * Math.PI * 2),
    [],
  );

  return (
    <group ref={group} visible={false}>
      <instancedMesh
        ref={instRef}
        args={[undefined, tickMaterial, TICKS]}
        frustumCulled={false}
      >
        <boxGeometry args={[0.02, 0.22, 0.02]} />
      </instancedMesh>
      <mesh material={ringMaterial}>
        <torusGeometry args={[R, 0.008, 8, 128]} />
      </mesh>
      {/* place ticks once via the instanced matrices */}
      <TicksPlace instRef={instRef} angles={angles} quat={quat} pos={pos} scale={scale} tmpMat={tmpMat} reduced={reduced} />
    </group>
  );
}

function TicksPlace({
  instRef,
  angles,
  quat,
  pos,
  scale,
  tmpMat,
  reduced,
}: {
  instRef: React.RefObject<THREE.InstancedMesh | null>;
  angles: number[];
  quat: THREE.Quaternion;
  pos: THREE.Vector3;
  scale: THREE.Vector3;
  tmpMat: THREE.Matrix4;
  reduced: boolean;
}) {
  const done = useRef(false);
  useEffect(() => {
    if (done.current || reduced) return;
    const inst = instRef.current;
    if (!inst) return;
    done.current = true;
    angles.forEach((a, i) => {
      pos.set(Math.cos(a) * R, Math.sin(a) * R, 0);
      quat.setFromAxisAngle(new THREE.Vector3(0, 0, 1), a - Math.PI / 2);
      tmpMat.compose(pos, quat, scale);
      inst.setMatrixAt(i, tmpMat);
    });
    inst.instanceMatrix.needsUpdate = true;
  }, [angles, instRef, pos, quat, scale, tmpMat, reduced]);
  return null;
}
