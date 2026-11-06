'use client';

import { Suspense, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import Rig from './Rig';
import Backdrop from './Backdrop';
import Stars from './Stars';
import GridFloor from './GridFloor';
import Rings from './Rings';
import HeroModel from './HeroModel';
import Dial from './Dial';
import Corridor from './Corridor';
import Panels from './Panels';
import CycleRing from './CycleRing';
import ProgressRing from './ProgressRing';
import Dust from './Dust';
import Post from './Post';
import { themeColors, updateThemeColors, syncThemeTarget } from '@/lib/useThemeColors';
import { useStore } from '@/state/store';

/** Scene composition (plan §6.3). Layers fade through eased `presence`. */
export default function Scene() {
  const scene = useThree((s) => s.scene);
  const themeId = useStore((s) => s.themeId);

  useEffect(() => {
    scene.background = themeColors.bg; // shared instance, eased every frame
    const fog = new THREE.FogExp2('#04050D', 0.028);
    fog.color = themeColors.bg;
    scene.fog = fog;
    return () => {
      scene.background = null;
      scene.fog = null;
    };
  }, [scene]);

  useEffect(() => {
    syncThemeTarget(themeId);
  }, [themeId]);

  useFrame((_, dt) => {
    updateThemeColors(dt);
  });

  return (
    <>
      <Rig />
      <Backdrop />
      <Stars />
      <GridFloor />
      <Rings />
      <Suspense fallback={null}>
        <HeroModel />
      </Suspense>
      <Dial />
      <Corridor />
      <Panels />
      <CycleRing />
      <ProgressRing />
      <Dust />
      <Post />
    </>
  );
}
