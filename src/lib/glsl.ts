/**
 * Shared GLSL chunks. Every colour-outputting fragment shader must end with
 * the FINISH chunk (tonemapping_fragment → colorspace_fragment) and dither
 * dark gradients (plan §2.3.8).
 */

/** Hash / value-noise / fbm with a compile-time octave count. */
export const glslNoise = (octaves: number) => /* glsl */ `
float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0;
  float amp = 0.5;
  for (int i = 0; i < ${octaves}; i++) {
    v += amp * vnoise(p);
    p = p * 2.02 + vec2(11.3, 7.7);
    amp *= 0.5;
  }
  return v;
}
float sdRoundBox(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}
`;

/** Tone mapping + output colour space. Requires gl_FragColor (GLSL1 ShaderMaterial). */
export const GLSL_FINISH = /* glsl */ `
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
`;

/** Banding dither for dark gradients — call after FINISH. */
export const GLSL_DITHER = /* glsl */ `
  gl_FragColor.rgb += (hash21(gl_FragCoord.xy + uTime) - 0.5) / 255.0;
`;
