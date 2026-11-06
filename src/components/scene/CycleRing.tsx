'use client';

import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { GLSL_FINISH } from '@/lib/glsl';
import { themeColors } from '@/lib/useThemeColors';
import { presence, motion, damp, sceneRefs, clamp01 } from '@/lib/motion';
import { getTheme } from '@/lib/themes';
import { useStore } from '@/state/store';

/**
 * L8 Cycle ring (§6.3 + §9.6). With the headset absent from the method
 * section, the six-node loop is the section's 3D subject:
 *  - a dim base ring carries six step nodes,
 *  - a bright arc sweeps clockwise with the continuous pin5 progress,
 *    lighting each node as its step activates,
 *  - the active node pops and fires a one-shot expanding halo.
 * The ring is static (no per-step rotation) so the arc reads as "one loop".
 */

const NODES = 6;
const R = 2.2;
const TAU = Math.PI * 2;

const VERT = /* glsl */ `
varying vec2 vLocal;
void main() {
  vLocal = position.xy;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

/** Band at radius R; clockwise fill from +X (node 0) with a bright leading cap. */
const ARC_FRAG = /* glsl */ `
uniform float uArc;
uniform float uOpacity;
uniform vec3 uColor;
varying vec2 vLocal;
void main() {
  float r = length(vLocal);
  float band = 1.0 - smoothstep(0.035, 0.055, abs(r - ${R.toFixed(1)}));
  float a = atan(-vLocal.y, vLocal.x);
  float frac = (a < 0.0 ? a + 6.2831853 : a) / 6.2831853;
  float aa = fwidth(frac) * 1.5 + 0.002;
  float filled = 1.0 - smoothstep(uArc - aa, uArc, frac);
  float alpha = band * 0.95 * filled;
  vec3 col = uColor * 1.1;
  float cap = band * (1.0 - smoothstep(0.004, 0.02, abs(frac - uArc)));
  col += uColor * cap * 1.4;
  alpha = max(alpha, cap * 0.9);
  alpha *= uOpacity;
  if (alpha < 0.004) discard;
  gl_FragColor = vec4(col, alpha);
${GLSL_FINISH}
`;

/** One-shot halo expanding from the active node. */
const RIPPLE_FRAG = /* glsl */ `
uniform float uPulse;
uniform vec3 uColor;
varying vec2 vLocal;
void main() {
  float r = length(vLocal);
  float pr = mix(0.1, 1.0, uPulse);
  float band = 1.0 - smoothstep(0.015, 0.05, abs(r - pr));
  float a = band * (1.0 - uPulse) * 0.7;
  if (a < 0.004) discard;
  gl_FragColor = vec4(uColor, a);
${GLSL_FINISH}
`;

export default function CycleRing() {
  const themeId = useStore((s) => s.themeId);
  const reduced = useStore((s) => s.reducedMotion);
  const group = useRef<THREE.Group>(null);
  const nodeRefs = useRef<(THREE.Mesh | null)[]>([]);
  const rippleRef = useRef<THREE.Mesh>(null);
  const nodeScales = useRef<number[]>(new Array(NODES).fill(1));
  const lastStep = useRef(-1);
  const pulseT0 = useRef(-10);
  const arc = useRef(0);

  const ringMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: themeColors.accent2,
        transparent: true,
        opacity: 0.25,
        depthWrite: false,
      }),
    [],
  );
  const connectorMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: themeColors.accent2,
        transparent: true,
        opacity: 0.35,
        depthWrite: false,
      }),
    [],
  );
  const nodeMaterials = useMemo(
    () =>
      Array.from(
        { length: NODES },
        () =>
          new THREE.MeshBasicMaterial({
            color: themeColors.c3,
            transparent: true,
            opacity: 0.4,
            depthWrite: false,
          }),
      ),
    [],
  );

  const arcUniforms = useMemo(
    () => ({
      uArc: { value: 0 },
      uOpacity: { value: 0 },
      uColor: { value: themeColors.accent },
    }),
    [],
  );
  const rippleUniforms = useMemo(
    () => ({
      uPulse: { value: 2 },
      uColor: { value: themeColors.accent },
    }),
    [],
  );

  const arcMatRef = useRef<THREE.ShaderMaterial>(null);
  const rippleMatRef = useRef<THREE.ShaderMaterial>(null);

  useEffect(() => {
    const dark = getTheme(themeId).mode === 'dark';
    const blending = dark ? THREE.AdditiveBlending : THREE.NormalBlending;
    ringMaterial.blending = blending;
    connectorMaterial.blending = blending;
    for (const m of nodeMaterials) {
      m.blending = blending;
      m.needsUpdate = true;
    }
    ringMaterial.needsUpdate = true;
    connectorMaterial.needsUpdate = true;
  }, [themeId, ringMaterial, connectorMaterial, nodeMaterials]);

  const nodeAngles = useMemo(
    () => Array.from({ length: NODES }, (_, i) => (i / NODES) * TAU),
    [],
  );
  const midAngles = useMemo(
    () => Array.from({ length: NODES }, (_, i) => ((i + 0.5) / NODES) * TAU),
    [],
  );

  useFrame((state, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05);
    const t = state.clock.elapsedTime;
    const g = group.current;
    if (!g) return;
    const p = presence.cycle;
    g.visible = p > 0.01;
    if (!g.visible) return;

    const hero = sceneRefs.heroGroup;
    if (hero) g.position.copy(hero.position);

    // continuous arc progress through the six steps
    const step = Math.min(NODES - 1, Math.max(0, Math.floor(motion.pin5 * NODES)));
    arc.current = damp(arc.current, motion.pin5, dt, 4);
    arcUniforms.uArc.value = clamp01(arc.current);
    arcUniforms.uOpacity.value = p;
    ringMaterial.opacity = 0.25 * p;
    connectorMaterial.opacity = 0.35 * p;

    // node states: passed nodes lit, active node popped
    for (let i = 0; i < NODES; i++) {
      const node = nodeRefs.current[i];
      if (!node) continue;
      const passed = arc.current >= i / NODES - 0.002;
      const active = i === step;
      const target = active ? 0.16 / 0.09 : 1;
      nodeScales.current[i] = damp(nodeScales.current[i], target, dt, 8);
      node.scale.setScalar(nodeScales.current[i]);
      const m = node.material as THREE.MeshBasicMaterial;
      m.opacity = (active ? 1 : passed ? 0.9 : 0.4) * p;
    }

    // one-shot halo on step change
    if (step !== lastStep.current) {
      lastStep.current = step;
      pulseT0.current = t;
      const ripple = rippleRef.current;
      if (ripple) {
        const a = (step / NODES) * TAU;
        ripple.position.set(Math.cos(a) * R, Math.sin(a) * R, 0.01);
      }
    }
    const pulse = reduced ? 2 : (t - pulseT0.current) / 0.9;
    rippleUniforms.uPulse.value = pulse;
    const ripple = rippleRef.current;
    if (ripple) ripple.visible = pulse >= 0 && pulse < 1;
  });

  return (
    <group ref={group} visible={false}>
      <mesh material={ringMaterial}>
        <torusGeometry args={[R, 0.012, 8, 128]} />
      </mesh>
      <mesh frustumCulled={false}>
        <planeGeometry args={[5.2, 5.2]} />
        <shaderMaterial
          ref={arcMatRef}
          vertexShader={VERT}
          fragmentShader={ARC_FRAG}
          uniforms={arcUniforms}
          transparent
          depthWrite={false}
        />
      </mesh>
      {nodeAngles.map((a, i) => (
        <mesh
          key={`n-${i}`}
          ref={(el) => {
            nodeRefs.current[i] = el;
          }}
          material={nodeMaterials[i]}
          position={[Math.cos(a) * R, Math.sin(a) * R, 0]}
        >
          <sphereGeometry args={[0.09, 16, 16]} />
        </mesh>
      ))}
      {midAngles.map((a, i) => (
        <mesh
          key={`c-${i}`}
          material={connectorMaterial}
          position={[Math.cos(a) * R, Math.sin(a) * R, 0]}
          rotation={[0, 0, a + Math.PI / 2]}
        >
          <boxGeometry args={[0.3, 0.014, 0.014]} />
        </mesh>
      ))}
      <mesh ref={rippleRef} frustumCulled={false} visible={false}>
        <planeGeometry args={[2.4, 2.4]} />
        <shaderMaterial
          ref={rippleMatRef}
          vertexShader={VERT}
          fragmentShader={RIPPLE_FRAG}
          uniforms={rippleUniforms}
          transparent
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
