'use client';

import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '@/state/store';
import { motion, presence, presenceT, fx, fxT, heroTarget, damp, smooth } from '@/lib/motion';
import { REGISTER_KEY, sampleKeysInto, WORK } from '@/lib/keyframes';

/**
 * Camera + hero rig (plan §6.4). Reads `motion` (written by the scroll
 * engine), eases toward keyframe targets, writes `presence`, `fx` and
 * `heroTarget` for the layers. No allocations in useFrame — all temps hoisted.
 */

const camPos = new THREE.Vector3(0, 0.2, 7.5);
const camLook = new THREE.Vector3(0, 0, 0);
const keyCam = new THREE.Vector3();
const keyLook = new THREE.Vector3();
const corrCam = new THREE.Vector3();
const corrLook = new THREE.Vector3();
const mxS = { v: 0 };
const myS = { v: 0 };

const PRESENCE_KEYS = Object.keys(presenceT) as (keyof typeof presenceT)[];
const FX_KEYS = Object.keys(fxT) as (keyof typeof fxT)[];

const TAU = Math.PI * 2;

export default function Rig() {
  const camera = useThree((s) => s.camera);
  const route = useStore((s) => s.route);
  const regStep = useStore((s) => s.regStep);
  const xrMode = useStore((s) => s.xrMode);

  useFrame((state, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05);
    const mobile = window.innerWidth < 760;

    // ---- keyframe targets
    const key = route === 'register' ? REGISTER_KEY : sampleKeysInto(motion.sf, WORK);

    // ---- corridor rig (§6.4.2): camera pinned, corridor slides
    let corrMix = 0;
    if (route === 'home') {
      // Stage dim while entering the corridor; recovers as the section exits.
      const stageDim = Math.min(
        1,
        (1 - smooth(0, 0.7, motion.e3)) + smooth(0, 0.6, motion.x3),
      );
      const corrEnter = smooth(0.25, 1, motion.e3);
      const corrExit = 1 - smooth(0, 0.6, motion.x3);
      presenceT.corr = Math.min(corrEnter, corrExit);
      corrMix = smooth(0, 0.5, motion.e3) * (1 - smooth(0, 0.8, motion.x3));
      presenceT.hero = key.hero.pr * stageDim;
      presenceT.dial = key.L.dial * stageDim;
      presenceT.rings = key.L.rings * stageDim;
    } else {
      presenceT.corr = 0;
      presenceT.hero = key.hero.pr;
      presenceT.dial = key.L.dial;
      presenceT.rings = key.L.rings;
    }
    presenceT.stars = key.L.stars;
    presenceT.grid = key.L.grid;
    presenceT.panels = key.L.panels;
    presenceT.cycle = key.L.cycle;
    presenceT.dust = key.L.dust;
    presenceT.progress = key.L.progress;

    // Phones: minimalist background — content-tied layers stay, decoration goes
    if (mobile) {
      presenceT.stars = 0;
      presenceT.dust = 0;
      presenceT.rings = 0;
      presenceT.panels = 0;
      presenceT.grid = Math.min(presenceT.grid, 0.35);
      fxT.warpMul = 0;
    }

    for (const k of PRESENCE_KEYS) presence[k] = damp(presence[k], presenceT[k], dt, 3);

    // ---- fx targets from XR-mode preview (§6.6) and register progress (§10.2)
    if (xrMode === 'vr') {
      fxT.bright = 1.25; fxT.warpMul = 1.6; fxT.gridMul = 0.4; fxT.ringsMul = 1.3;
      fxT.starsMul = 1.3; fxT.heroScaleMul = 1.15; fxT.ringTilt = 0;
    } else if (xrMode === 'ar') {
      fxT.bright = 0.6; fxT.warpMul = 0.5; fxT.gridMul = 1.6; fxT.ringsMul = 0.6;
      fxT.starsMul = 0.5; fxT.heroScaleMul = 0.9; fxT.ringTilt = 0;
    } else if (xrMode === 'mr') {
      fxT.bright = 0.9; fxT.warpMul = 1.0; fxT.gridMul = 1.3; fxT.ringsMul = 1.1;
      fxT.starsMul = 1.0; fxT.heroScaleMul = 1.0; fxT.ringTilt = (12 * Math.PI) / 180;
    } else {
      fxT.bright = 1; fxT.warpMul = 1; fxT.gridMul = 1; fxT.ringsMul = 1;
      fxT.starsMul = 1; fxT.heroScaleMul = 1; fxT.ringTilt = 0;
    }
    if (route === 'register') {
      const p = regStep / 4;
      fxT.bright = Math.max(fxT.bright, 1 + 0.2 * p);
      fxT.rimBoost = 1 + 1.6 * p; // rim light 1.0 → 2.6
    } else {
      fxT.rimBoost = 1;
    }
    for (const k of FX_KEYS) fx[k] = damp(fx[k], fxT[k], dt, 3);

    // ---- camera
    keyCam.set(key.cam[0], key.cam[1], key.cam[2]);
    keyLook.set(key.look[0], key.look[1], key.look[2]);
    if (mobile) {
      keyCam.z += 1.5;
      keyLook.x = 0;
    }
    if (corrMix > 0.001) {
      const p3 = motion.pin3;
      corrCam.set(0.35 * Math.sin(p3 * TAU), 0.12 * Math.sin(p3 * Math.PI), 8);
      corrLook.set(0, 0, -10);
      keyCam.lerp(corrCam, corrMix);
      keyLook.lerp(corrLook, corrMix);
    }
    camPos.x = damp(camPos.x, keyCam.x, dt, 3);
    camPos.y = damp(camPos.y, keyCam.y, dt, 3);
    camPos.z = damp(camPos.z, keyCam.z, dt, 3);
    camLook.x = damp(camLook.x, keyLook.x, dt, 3);
    camLook.y = damp(camLook.y, keyLook.y, dt, 3);
    camLook.z = damp(camLook.z, keyLook.z, dt, 3);

    // pointer parallax (§7.4), smoothed
    mxS.v = damp(mxS.v, motion.mx, dt, 4);
    myS.v = damp(myS.v, motion.my, dt, 4);
    camera.position.set(camPos.x + mxS.v * 0.4, camPos.y - myS.v * 0.25, camPos.z);
    camera.lookAt(camLook);
    if (corrMix > 0.001) {
      camera.rotation.z += 0.02 * Math.sin(motion.pin3 * TAU) * corrMix;
    }

    // ---- hero target (consumed by HeroModel)
    heroTarget.px = key.hero.p[0];
    heroTarget.py = key.hero.p[1];
    heroTarget.pz = key.hero.p[2];
    heroTarget.rx = key.hero.r[0];
    heroTarget.ry = key.hero.r[1];
    heroTarget.rz = key.hero.r[2];
    heroTarget.s = key.hero.s;
    heroTarget.pr = presence.hero;
    if (mobile) {
      heroTarget.px = 0;
      heroTarget.py += 1.3;
      heroTarget.s *= 0.62;
    }
  });

  return null;
}
