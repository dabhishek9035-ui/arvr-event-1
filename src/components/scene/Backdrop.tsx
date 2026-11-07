'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { glslNoise, GLSL_FINISH } from '@/lib/glsl';
import { themeColors } from '@/lib/useThemeColors';
import { fx } from '@/lib/motion';
import { getTheme } from '@/lib/themes';
import { useStore } from '@/state/store';

/**
 * L0 Backdrop (plan §6.3): full-screen triangle, domain-warped fbm ramped
 * c1 → c2 → c3, vignette, left-side dimming for text columns, dither.
 */

const VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = position.xy * 0.5 + 0.5;
  gl_Position = vec4(position.xy, 1.0, 1.0);
}
`;

function makeFrag(octaves: number, warp: boolean): string {
  return /* glsl */ `
uniform float uTime;
uniform float uBright;
uniform float uWarp;
uniform vec3 uC1;
uniform vec3 uC2;
uniform vec3 uC3;
varying vec2 vUv;
${glslNoise(octaves)}
void main() {
  vec2 uv = vUv;
  vec2 p = uv * vec2(2.6, 1.6);
  float t = uTime * 0.0625;
  ${warp ? `
  vec2 w = vec2(fbm(p + vec2(t, 0.0)), fbm(p + vec2(0.0, t) + 5.2));
  p += (w - 0.5) * uWarp * 1.6;
  ` : ''}
  float n = fbm(p + vec2(t * 0.7, -t * 0.4));
  vec3 col = uC1;
  col = mix(col, uC2, smoothstep(0.3, 0.82, n) * 0.5);
  col = mix(col, uC3, smoothstep(0.72, 0.98, n) * 0.35);
  vec2 c = uv - 0.5;
  float vig = 1.0 - 0.32 * smoothstep(0.3, 0.85, length(c * vec2(1.15, 1.0)) * 1.414);
  col *= vig;
  col *= mix(0.68, 1.0, smoothstep(0.0, 0.45, uv.x));
  col *= 0.8 * uBright;
  gl_FragColor = vec4(col, 1.0);
${GLSL_FINISH}
  gl_FragColor.rgb += (hash21(gl_FragCoord.xy + uTime) - 0.5) / 255.0;
}
`;
}

export default function Backdrop() {
  const quality = useStore((s) => s.quality);
  const themeId = useStore((s) => s.themeId);
  const reduced = useStore((s) => s.reducedMotion);
  const theme = getTheme(themeId);

  const octaves = quality === 'high' ? 5 : quality === 'medium' ? 4 : 3;
  const frag = useMemo(() => makeFrag(octaves, quality !== 'low'), [octaves, quality]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uBright: { value: 1 },
      uWarp: { value: theme.scene.warp },
      uC1: { value: themeColors.c1 },
      uC2: { value: themeColors.c2 },
      uC3: { value: themeColors.c3 },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute(
      'position',
      new THREE.BufferAttribute(new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]), 3),
    );
    return g;
  }, []);

  useFrame((state) => {
    uniforms.uTime.value = reduced ? 0 : state.clock.elapsedTime;
    uniforms.uBright.value = fx.bright;
    uniforms.uWarp.value = window.innerWidth < 760 ? 0 : theme.scene.warp * fx.warpMul;
  });

  return (
    <mesh geometry={geometry} frustumCulled={false} renderOrder={-10}>
      <shaderMaterial
        key={frag}
        vertexShader={VERT}
        fragmentShader={frag}
        uniforms={uniforms}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  );
}
