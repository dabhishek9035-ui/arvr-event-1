'use client';

import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { GLSL_FINISH } from '@/lib/glsl';
import { themeColors } from '@/lib/useThemeColors';
import { presence, damp, sceneRefs } from '@/lib/motion';
import { useStore } from '@/state/store';

/**
 * L9 Progress ring (register only, plan §10.2): arc fills clockwise from
 * 12 o'clock with a bright leading cap; unfilled = dim. uArc = regStep/4.
 * Done state fires a single 900 ms expanding ring pulse.
 */

const VERT = /* glsl */ `
varying vec2 vLocal;
void main() {
  vLocal = position.xy;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const FRAG = /* glsl */ `
uniform float uArc;
uniform float uPulse;
uniform vec3 uColor;
uniform vec3 uDim;
uniform float uOpacity;
varying vec2 vLocal;
void main() {
  float r = length(vLocal);
  float band = 1.0 - smoothstep(0.03, 0.045, abs(r - 2.3));
  float a = atan(vLocal.x, vLocal.y);
  float frac = (a < 0.0 ? a + 6.2831853 : a) / 6.2831853;
  float aa = fwidth(frac) * 1.5 + 0.002;
  float filled = 1.0 - smoothstep(uArc - aa, uArc, frac);
  float alpha = band * mix(0.25, 1.0, filled);
  vec3 col = mix(uDim, uColor, filled);
  float cap = band * (1.0 - smoothstep(0.008, 0.03, abs(frac - uArc)));
  col += uColor * cap * 1.2;
  alpha = max(alpha, cap * 0.9);
  if (uPulse > 0.001 && uPulse < 0.999) {
    float pr = 2.3 + uPulse * 2.7;
    float pb = 1.0 - smoothstep(0.05, 0.1, abs(r - pr));
    float pa = pb * 0.6 * (1.0 - uPulse);
    col += uColor * pa;
    alpha = max(alpha, pa);
  }
  alpha *= uOpacity;
  if (alpha < 0.004) discard;
  gl_FragColor = vec4(col, alpha);
${GLSL_FINISH}
}
`;

export default function ProgressRing() {
  const regStep = useStore((s) => s.regStep);
  const group = useRef<THREE.Group>(null);
  const arc = useRef(0);
  const pulseT0 = useRef(-1);
  const prevStep = useRef(0);
  const dimColor = useMemo(() => new THREE.Color(), []);

  const uniforms = useMemo(
    () => ({
      uArc: { value: 0 },
      uPulse: { value: 0 },
      uColor: { value: themeColors.accent },
      uDim: { value: dimColor },
      uOpacity: { value: 0 },
    }),
    [dimColor],
  );

  useFrame((state) => {
    const g = group.current;
    if (!g) return;
    const p = presence.progress;
    g.visible = p > 0.01;
    if (!g.visible) return;

    if (prevStep.current !== regStep) {
      if (regStep >= 4) pulseT0.current = state.clock.elapsedTime;
      prevStep.current = regStep;
    }
    const p01 = regStep / 4;
    arc.current = damp(arc.current, p01, Math.min(0.05, 1 / 60), 3);
    uniforms.uArc.value = arc.current;
    const el = pulseT0.current < 0 ? 2 : state.clock.elapsedTime - pulseT0.current;
    uniforms.uPulse.value = Math.min(1.5, Math.max(0, el / 0.9));
    dimColor.copy(themeColors.accent2).multiplyScalar(0.35);
    uniforms.uOpacity.value = p;

    const hero = sceneRefs.heroGroup;
    if (hero) g.position.copy(hero.position);
    g.quaternion.copy(state.camera.quaternion);
  });

  return (
    <group ref={group} visible={false}>
      <mesh frustumCulled={false}>
        <planeGeometry args={[5.6, 5.6]} />
        <shaderMaterial
          vertexShader={VERT}
          fragmentShader={FRAG}
          uniforms={uniforms}
          transparent
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
