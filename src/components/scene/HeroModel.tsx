'use client';

import { Component, Suspense, useEffect, useMemo, useRef, type ReactNode } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useGLTF, Environment, Lightformer } from '@react-three/drei';
import { clone as skeletonClone } from 'three/examples/jsm/utils/SkeletonUtils.js';
import { heroTarget, fx, motion, sceneRefs, damp } from '@/lib/motion';
import { themeColors } from '@/lib/useThemeColors';
import { THEMES } from '@/lib/themes';
import { useStore } from '@/state/store';

/**
 * L4 Hero model (plan §6.5): a REAL headset GLB, auto-fitted to 2.4 units,
 * recentred, studio-lit with a procedural environment. The Rig writes
 * `heroTarget`; idle float / pointer parallax / scroll spin are added here.
 */

const FIT = 2.8;

class SilentBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function Headset() {
  const group = useRef<THREE.Group>(null);
  const keyRef = useRef<THREE.DirectionalLight>(null);
  const rimRef = useRef<THREE.DirectionalLight>(null);
  const setModelReady = useStore((s) => s.setModelReady);
  const reduced = useStore((s) => s.reducedMotion);
  const themeId = useStore((s) => s.themeId);

  const gltf = useGLTF('/models/headset.glb');
  const scene = useMemo(() => {
    const c = skeletonClone(gltf.scene) as THREE.Group;
    c.updateMatrixWorld(true);
    return c;
  }, [gltf]);

  const fit = useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    return { s: FIT / maxDim, center };
  }, [scene]);

  useEffect(() => {
    scene.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      const mat = mesh.material as THREE.MeshStandardMaterial;
      if (!mat) return;
      mat.envMapIntensity = 1.4;
      if (typeof mat.roughness === 'number' && mat.roughness < 0.05) mat.roughness = 0.05;
    });
    setModelReady(true);
  }, [scene, setModelReady]);

  useEffect(() => {
    sceneRefs.heroGroup = group.current;
    return () => {
      if (sceneRefs.heroGroup === group.current) sceneRefs.heroGroup = null;
    };
  }, []);

  const load = useRef(0);
  const pxS = useRef(0);
  const pyS = useRef(0);
  const spinS = useRef(0);

  useFrame((state, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05);
    const t = state.clock.elapsedTime;
    const g = group.current;
    if (!g) return;

    load.current = damp(load.current, 1, dt, 2.5); // ~1.2 s load-in
    pxS.current = damp(pxS.current, motion.mx, dt, 4);
    pyS.current = damp(pyS.current, motion.my, dt, 4);
    spinS.current = damp(spinS.current, motion.velocity * 0.35, dt, 4);

    const idle = reduced ? 0 : 1;
    g.position.set(
      heroTarget.px,
      heroTarget.py + idle * 0.08 * Math.sin(t * 0.6),
      heroTarget.pz,
    );
    g.rotation.set(
      heroTarget.rx + idle * -pyS.current * 0.12,
      heroTarget.ry + idle * (pxS.current * 0.25 + spinS.current),
      heroTarget.rz + idle * 0.02 * Math.sin(t * 0.45),
    );
    const pr = heroTarget.pr;
    g.visible = pr > 0.01;
    const s = Math.max(
      0.001,
      heroTarget.s * fx.heroScaleMul * (0.85 + 0.15 * load.current) * (0.001 + 0.999 * pr),
    );
    g.scale.setScalar(s);

    const key = keyRef.current;
    const rim = rimRef.current;
    const lightLevel = pr * load.current;
    if (key) key.intensity = 1.6 * lightLevel;
    if (rim) rim.intensity = 2.2 * fx.rimBoost * lightLevel;
  });

  const theme = THEMES.find((th) => th.id === themeId) ?? THEMES[0];

  return (
    <>
      {/* world-fixed studio lighting (not children of the rotating stage) */}
      <directionalLight ref={keyRef} intensity={1.1} position={[3, 4, 5]} color="#fff1e0" />
      <directionalLight ref={rimRef} intensity={2.0} position={[-4, 2, -3]}>
        <primitive object={themeColors.rim} attach="color" />
      </directionalLight>
      <Environment key={themeId} frames={1} resolution={256}>
        <Lightformer intensity={2.2} position={[0, 5, 0]} rotation-x={Math.PI / 2} scale={[10, 10, 1]} />
        <Lightformer form="rect" intensity={2.6} color={theme.scene.c3} position={[-5, 1, -1]} rotation-y={Math.PI / 2} scale={[8, 2, 1]} />
        <Lightformer form="rect" intensity={2.0} color={theme.scene.c2} position={[5, 0, -1]} rotation-y={-Math.PI / 2} scale={[8, 2, 1]} />
      </Environment>

      <group ref={group}>
        <group scale={fit.s} position={[-fit.center.x * fit.s, -fit.center.y * fit.s, -fit.center.z * fit.s]}>
          <primitive object={scene} />
        </group>
      </group>
    </>
  );
}

/** Wraps the async GLB load so a missing/failed asset never breaks the scene. */
export default function HeroModel() {
  return (
    <SilentBoundary>
      <Suspense fallback={null}>
        <Headset />
      </Suspense>
    </SilentBoundary>
  );
}

useGLTF.preload('/models/headset.glb');
