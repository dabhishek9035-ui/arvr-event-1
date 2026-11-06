'use client';

import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { GLSL_FINISH } from '@/lib/glsl';
import { themeColors } from '@/lib/useThemeColors';
import { presence, fx, sceneRefs, motion } from '@/lib/motion';
import { getTheme } from '@/lib/themes';
import { useStore } from '@/state/store';

/**
 * L3 Rings (plan §6.3): three thin tori around the hero + the dark-theme halo
 * disc. radiusMul = 2 − e so rings:1.2 in the join key converges to ×0.8.
 */

const GLOW_FRAG = /* glsl */ `
uniform vec3 uColor;
uniform float uOpacity;
varying vec2 vUv;
void main() {
  float d = length(vUv - 0.5) * 2.0;
  float a = (1.0 - smoothstep(0.0, 1.0, d)) * 0.22 * uOpacity;
  gl_FragColor = vec4(uColor, a);
${GLSL_FINISH}
}
`;
const GLOW_VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const RADII = [1.9, 2.4, 3.0];
const SEGMENTS = { high: 128, medium: 96, low: 64 } as const;
const SPEEDS = [0.08, -0.06, 0.05];

export default function Rings() {
  const quality = useStore((s) => s.quality);
  const themeId = useStore((s) => s.themeId);
  const reduced = useStore((s) => s.reducedMotion);
  const group = useRef<THREE.Group>(null);
  const glowGroup = useRef<THREE.Group>(null);
  const ringRefs = useRef<(THREE.Mesh | null)[]>([null, null, null]);
  const scales = useRef([1, 1, 1]);

  const materials = useMemo(() => {
    const mk = (alphaBase: number) =>
      new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, opacity: alphaBase });
    const mats = [mk(0.9), mk(0.75), mk(0.6)];
    mats[0].color = themeColors.accent;
    mats[1].color = themeColors.accent2;
    mats[2].color = themeColors.c3;
    return mats;
  }, []);

  const glowUniforms = useMemo(
    () => ({ uColor: { value: themeColors.accent }, uOpacity: { value: 0.22 } }),
    [],
  );

  useEffect(() => {
    const dark = getTheme(themeId).mode === 'dark';
    for (const m of materials) {
      m.blending = dark ? THREE.AdditiveBlending : THREE.NormalBlending;
      m.needsUpdate = true;
    }
  }, [themeId, materials]);

  const geometries = useMemo(
    () => RADII.map((r) => new THREE.TorusGeometry(r, 0.012, 16, SEGMENTS[quality])),
    [quality],
  );

  useFrame((state, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05);
    const t = state.clock.elapsedTime;
    const e = Math.min(1.3, presence.rings * Math.max(0, fx.ringsMul));
    const g = group.current;
    if (!g) return;
    g.visible = e > 0.01;
    if (!g.visible) return;

    const hero = sceneRefs.heroGroup;
    if (hero) g.position.copy(hero.position);

    const radiusMul = Math.min(1.6, Math.max(0.7, 2 - e));
    for (let i = 0; i < 3; i++) {
      const ring = ringRefs.current[i];
      if (!ring) continue;
      const target = radiusMul * (1 + (reduced ? 0 : 0.02 * Math.sin(t * ((Math.PI * 2) / 9))));
      scales.current[i] += (target - scales.current[i]) * (1 - Math.exp(-dt * 6));
      ring.scale.setScalar(scales.current[i]);
      if (!reduced) {
        ring.rotation[SPEEDS[i] > 0 ? 'x' : 'y'] += (SPEEDS[i] + motion.velocity * 0.15) * dt;
      }
      materials[i].opacity = Math.min(1.3, e) * 0.85;
    }

    // halo disc (dark theme only)
    const glow = glowGroup.current;
    if (glow) {
      const dark = getTheme(themeId).mode === 'dark';
      glow.visible = dark && presence.hero > 0.05;
      if (glow.visible) {
        glow.position.copy(hero ? hero.position : g.position);
        glow.quaternion.copy(state.camera.quaternion);
        const s = 1.15 * radiusMul;
        glow.scale.setScalar(s);
        glowUniforms.uOpacity.value = 0.22 * presence.hero;
      }
    }
  });

  return (
    <>
      <group ref={group}>
        {geometries.map((geo, i) => (
          <mesh
            key={i}
            ref={(el) => {
              ringRefs.current[i] = el;
            }}
            geometry={geo}
            material={materials[i]}
            rotation={[Math.PI / 2 + i * 0.22, i * 0.35, i * 0.18]}
          />
        ))}
      </group>
      <group ref={glowGroup}>
        <mesh position={[0, 0, -0.4]} frustumCulled={false}>
          <planeGeometry args={[4.4, 4.4]} />
          <shaderMaterial
            vertexShader={GLOW_VERT}
            fragmentShader={GLOW_FRAG}
            uniforms={glowUniforms}
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      </group>
    </>
  );
}
