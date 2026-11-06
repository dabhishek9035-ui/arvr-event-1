'use client';

import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { GLSL_FINISH } from '@/lib/glsl';
import { themeColors } from '@/lib/useThemeColors';
import { presence, motion } from '@/lib/motion';
import { getTheme } from '@/lib/themes';
import { useStore } from '@/state/store';

/**
 * L10 Dust (plan §6.3): ambient particles in a 14×8×14 volume wrapped with
 * mod in the vertex shader (world-anchored → correct parallax). Rises only
 * while scrolling.
 */

const COUNTS = { high: 600, medium: 300, low: 100 } as const;

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const VERT = /* glsl */ `
attribute float aSize;
uniform vec3 uCam;
uniform float uRise;
void main() {
  vec3 p = position;
  p.y += uRise;
  vec3 box = vec3(14.0, 8.0, 14.0);
  vec3 rel = mod(p - uCam + 0.5 * box, box) - 0.5 * box;
  vec4 mv = viewMatrix * vec4(uCam + rel, 1.0);
  gl_PointSize = clamp(aSize, 1.5, 3.0);
  gl_Position = projectionMatrix * mv;
}
`;

const FRAG = /* glsl */ `
uniform vec3 uColor;
uniform float uOpacity;
void main() {
  float d = length(gl_PointCoord - 0.5);
  float soft = 1.0 - smoothstep(0.3, 0.5, d);
  gl_FragColor = vec4(uColor, uOpacity * soft);
${GLSL_FINISH}
}
`;

export default function Dust() {
  const quality = useStore((s) => s.quality);
  const themeId = useStore((s) => s.themeId);
  const reduced = useStore((s) => s.reducedMotion);
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const count = COUNTS[quality];
  const { geometry, uniforms } = useMemo(() => {
    const rnd = mulberry32(11);
    const pos = new Float32Array(count * 3);
    const size = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (rnd() - 0.5) * 14;
      pos[i * 3 + 1] = (rnd() - 0.5) * 8;
      pos[i * 3 + 2] = (rnd() - 0.5) * 14;
      size[i] = 1.5 + rnd() * 1.5;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
    const uni = {
      uCam: { value: new THREE.Vector3() },
      uRise: { value: 0 },
      uColor: { value: themeColors.particle },
      uOpacity: { value: 0.35 },
    };
    return { geometry: g, uniforms: uni };
  }, [count]);

  useEffect(() => {
    const m = matRef.current;
    if (!m) return;
    m.blending = getTheme(themeId).scene.additive ? THREE.AdditiveBlending : THREE.NormalBlending;
    m.needsUpdate = true;
  }, [themeId]);

  useFrame((state, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05);
    uniforms.uCam.value.copy(state.camera.position);
    if (!reduced) {
      uniforms.uRise.value += (0.02 + motion.velocity * 0.25) * dt;
    }
    uniforms.uOpacity.value = 0.35 * presence.dust;
  });

  return (
    <points geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={matRef}
        vertexShader={VERT}
        fragmentShader={FRAG}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </points>
  );
}
