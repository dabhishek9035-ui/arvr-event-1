'use client';

import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { GLSL_FINISH } from '@/lib/glsl';
import { themeColors } from '@/lib/useThemeColors';
import { presence, fx, motion } from '@/lib/motion';
import { getTheme } from '@/lib/themes';
import { useStore } from '@/state/store';

/** L2 Grid floor (plan §6.3): world-space XZ grid that follows the camera. */

const VERT = /* glsl */ `
varying vec3 vWorld;
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWorld = wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;

const FRAG = /* glsl */ `
uniform vec3 uColor;
uniform float uOpacity;
uniform float uScroll;
uniform vec2 uCam;
uniform float uAlphaScale;
varying vec3 vWorld;
void main() {
  vec2 g = vec2(vWorld.x, vWorld.z + uScroll);
  vec2 u = g / 0.5;
  vec2 f = fract(u);
  vec2 dl = min(f, 1.0 - f);
  vec2 fw = fwidth(u) * 1.2;
  vec2 lineV = 1.0 - smoothstep(vec2(0.0), fw, dl);
  float line = max(lineV.x, lineV.y);
  vec2 u5 = g / 2.5;
  vec2 f5 = fract(u5);
  vec2 dl5 = min(f5, 1.0 - f5);
  vec2 fw5 = fwidth(u5) * 1.2;
  vec2 majV = 1.0 - smoothstep(vec2(0.0), fw5, dl5);
  float major = max(majV.x, majV.y);
  float d = distance(vWorld.xz, uCam);
  float q = d * 0.03;
  float fade = exp(-q * q);
  float a = (line * 0.55 + major * 0.55) * fade;
  a *= uOpacity * uAlphaScale;
  if (a < 0.004) discard;
  gl_FragColor = vec4(uColor, min(a, 0.55));
${GLSL_FINISH}
}
`;

export default function GridFloor() {
  const themeId = useStore((s) => s.themeId);
  const reduced = useStore((s) => s.reducedMotion);
  const mesh = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uColor: { value: themeColors.accent },
      uOpacity: { value: 0.35 },
      uScroll: { value: 0 },
      uCam: { value: new THREE.Vector2() },
      uAlphaScale: { value: 1 },
    }),
    [],
  );

  useEffect(() => {
    const m = matRef.current;
    if (!m) return;
    const dark = getTheme(themeId).mode === 'dark';
    m.blending = dark ? THREE.AdditiveBlending : THREE.NormalBlending;
    uniforms.uAlphaScale.value = dark ? 1 : 0.45;
    m.needsUpdate = true;
  }, [themeId, uniforms]);

  useFrame((state, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05);
    const cam = state.camera.position;
    uniforms.uCam.value.set(cam.x, cam.z);
    uniforms.uOpacity.value = Math.min(1, presence.grid * Math.max(0, fx.gridMul));
    if (!reduced) {
      uniforms.uScroll.value += (0.15 + motion.velocity * 2.2) * dt;
    }
    const mesh2 = mesh.current;
    if (mesh2) {
      mesh2.position.set(cam.x, -2.4, cam.z);
    }
  });

  return (
    <mesh ref={mesh} rotation={[-Math.PI / 2, 0, 0]} frustumCulled={false}>
      <planeGeometry args={[160, 160]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={VERT}
        fragmentShader={FRAG}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}
