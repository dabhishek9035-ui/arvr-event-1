'use client';

import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { GLSL_FINISH } from '@/lib/glsl';
import { themeColors } from '@/lib/useThemeColors';
import { presence, fx, motion } from '@/lib/motion';
import { getTheme } from '@/lib/themes';
import { useStore } from '@/state/store';

/** L1 Stars (plan §6.3): GPU-twinkling shell that follows the camera. */

const COUNTS = { high: 1800, medium: 900, low: 300 } as const;

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
attribute float aSeed;
uniform float uTime;
varying float vA;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  float tw = sin(uTime * (1.0 + aSeed * 3.0) + aSeed * 50.0);
  vA = 0.55 + 0.45 * tw;
  float ps = (1.5 + aSeed * 2.5) * (140.0 / max(1.0, -mv.z));
  gl_PointSize = clamp(ps, 1.0, 10.0);
  gl_Position = projectionMatrix * mv;
}
`;

const FRAG = /* glsl */ `
uniform vec3 uColor;
uniform float uOpacity;
varying float vA;
void main() {
  float d = length(gl_PointCoord - 0.5);
  float soft = 1.0 - smoothstep(0.35, 0.5, d);
  vec3 col = uColor * vA;
  gl_FragColor = vec4(col, uOpacity * vA * soft);
${GLSL_FINISH}
}
`;

export default function Stars() {
  const quality = useStore((s) => s.quality);
  const themeId = useStore((s) => s.themeId);
  const reduced = useStore((s) => s.reducedMotion);
  const group = useRef<THREE.Group>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const count = COUNTS[quality];
  const { geometry, uniforms } = useMemo(() => {
    const rnd = mulberry32(42);
    const pos = new Float32Array(count * 3);
    const seed = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const u = rnd() * 2 - 1;
      const phi = rnd() * Math.PI * 2;
      const r = 25 + rnd() * 20;
      const s = Math.sqrt(1 - u * u);
      pos[i * 3] = s * Math.cos(phi) * r;
      pos[i * 3 + 1] = u * r;
      pos[i * 3 + 2] = s * Math.sin(phi) * r;
      seed[i] = rnd();
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
    const uni = {
      uTime: { value: 0 },
      uColor: { value: themeColors.particle },
      uOpacity: { value: 1 },
    };
    return { geometry: g, uniforms: uni };
  }, [count]);

  useEffect(() => {
    const m = matRef.current;
    if (!m) return;
    m.blending = getTheme(themeId).scene.additive ? THREE.AdditiveBlending : THREE.NormalBlending;
    m.needsUpdate = true;
  }, [themeId]);

  useFrame((state) => {
    uniforms.uTime.value = reduced ? 0 : state.clock.elapsedTime;
    uniforms.uOpacity.value = Math.min(1, presence.stars * Math.max(0, fx.starsMul));
    const g = group.current;
    if (!g) return;
    g.position.copy(state.camera.position);
    if (!reduced) {
      g.rotation.y = 0.0025 * state.clock.elapsedTime + motion.progress * 0.5;
    }
  });

  return (
    <group ref={group}>
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
    </group>
  );
}
