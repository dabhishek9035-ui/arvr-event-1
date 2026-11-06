'use client';

import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { glslNoise, GLSL_FINISH } from '@/lib/glsl';
import { themeColors } from '@/lib/useThemeColors';
import { presence, motion } from '@/lib/motion';
import { getTheme } from '@/lib/themes';
import { useStore } from '@/state/store';

/**
 * L7 Panels (plan §6.3): floating spatial-UI quads on an ellipse with
 * deterministic jitter, rounded-rect border, scanline, depth-based parallax.
 */

const COUNTS = { high: 12, medium: 8, low: 0 } as const;

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface PanelCfg {
  x: number;
  y: number;
  z: number;
  s: number;
  roll: number;
  par: number;
}

const VERT = /* glsl */ `
varying vec2 vLocal;
varying vec3 vN;
varying vec3 vV;
void main() {
  vLocal = position.xy;
  vN = normalMatrix * normal;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vV = -mv.xyz;
  gl_Position = projectionMatrix * mv;
}
`;

function makeFrag(): string {
  return /* glsl */ `
uniform vec3 uColor;
uniform float uOpacity;
uniform float uTime;
varying vec2 vLocal;
varying vec3 vN;
varying vec3 vV;
${glslNoise(1)}
void main() {
  float d = sdRoundBox(vLocal, vec2(0.9, 0.55), 0.08);
  float aa = fwidth(d) * 1.5;
  float border = 1.0 - smoothstep(0.0, max(0.015, aa), abs(d));
  float inside = 1.0 - smoothstep(0.0, aa, d);
  float scan = 0.5 + 0.5 * sin(vLocal.y * 22.0 - uTime * 1.4);
  float fres = 1.0 - abs(dot(normalize(vN), normalize(vV)));
  float alpha = inside * (0.05 + 0.03 * scan) + border * (0.5 + 0.6 * fres);
  alpha *= uOpacity;
  if (alpha < 0.003) discard;
  gl_FragColor = vec4(uColor, alpha);
${GLSL_FINISH}
}
`;
}

export default function Panels() {
  const quality = useStore((s) => s.quality);
  const themeId = useStore((s) => s.themeId);
  const reduced = useStore((s) => s.reducedMotion);
  const group = useRef<THREE.Group>(null);
  const meshRefs = useRef<(THREE.Mesh | null)[]>([]);
  const pxS = useRef(0);
  const pyS = useRef(0);

  const cfgs = useMemo<PanelCfg[]>(() => {
    const rnd = mulberry32(7);
    const out: PanelCfg[] = [];
    for (let k = 0; k < COUNTS.high; k++) {
      const angle = (k / COUNTS.high) * Math.PI * 2 + (rnd() - 0.5) * 0.25;
      const z = -5 - (k % 3) * 1.2;
      out.push({
        x: Math.cos(angle) * 7.5 + (rnd() - 0.5) * 0.8,
        y: Math.sin(angle) * 4.0 + (rnd() - 0.5) * 0.6,
        z,
        s: 0.8 + rnd() * 0.4,
        roll: (rnd() - 0.5) * 0.16,
        par: 0.2 + (z + 7.4) * 0.15, // nearer (higher z) → more parallax
      });
    }
    return out;
  }, []);

  const count = COUNTS[quality];
  const frag = useMemo(() => makeFrag(), []);
  const uniforms = useMemo(
    () => ({
      uColor: { value: themeColors.accent },
      uOpacity: { value: 0 },
      uTime: { value: 0 },
    }),
    [],
  );
  const matRef = useRef<THREE.ShaderMaterial>(null);

  useEffect(() => {
    const m = matRef.current;
    if (!m) return;
    m.blending = getTheme(themeId).scene.additive ? THREE.AdditiveBlending : THREE.NormalBlending;
    m.needsUpdate = true;
  }, [themeId]);

  useFrame((state, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05);
    const g = group.current;
    if (!g) return;
    const p = presence.panels;
    g.visible = p > 0.01;
    if (!g.visible) return;

    uniforms.uOpacity.value = p;
    uniforms.uTime.value = reduced ? 0 : state.clock.elapsedTime;

    pxS.current += (motion.mx - pxS.current) * (1 - Math.exp(-dt * 4));
    pyS.current += (motion.my - pyS.current) * (1 - Math.exp(-dt * 4));
    for (let i = 0; i < count; i++) {
      const mesh = meshRefs.current[i];
      const cfg = cfgs[i];
      if (!mesh || !cfg) continue;
      mesh.position.set(cfg.x + pxS.current * cfg.par, cfg.y + pyS.current * cfg.par * 0.6, cfg.z);
      mesh.rotation.z = cfg.roll;
    }
  });

  if (count === 0) return null;

  return (
    <group ref={group} visible={false}>
      {cfgs.slice(0, count).map((cfg, i) => (
        <mesh
          key={i}
          ref={(el) => {
            meshRefs.current[i] = el;
          }}
          scale={cfg.s}
          frustumCulled={false}
        >
          <planeGeometry args={[1.8, 1.1]} />
          <shaderMaterial
            ref={i === 0 ? matRef : undefined}
            vertexShader={VERT}
            fragmentShader={frag}
            uniforms={uniforms}
            transparent
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}
