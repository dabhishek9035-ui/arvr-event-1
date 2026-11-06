#!/usr/bin/env node
/**
 * Static shader checks (plan §2.3.9):
 *  - never smoothstep(hi, lo, x) with descending literal edges (undefined)
 *  - never pow(negativeLiteral, y)
 *  - every colour-outputting fragment shader (writes gl_FragColor) must end
 *    with the FINISH chunk (#include <tonemapping_fragment> + <colorspace_fragment>)
 *  - warn (not fail) when a gradient shader lacks the dither line
 *
 * Usage: node scripts/check_shaders.mjs src
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const rootArg = process.argv[2] ?? 'src';
const roots = statSync(rootArg).isDirectory() ? [rootArg] : [rootArg];

const files = [];
function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    const s = statSync(p);
    if (s.isDirectory()) walk(p);
    else if (['.ts', '.tsx', '.js', '.mjs'].includes(extname(p))) files.push(p);
  }
}
for (const r of roots) walk(r);

const errors = [];
const warnings = [];
let shaderCount = 0;

const TEMPLATE = /(?:fragmentShader\s*=\s*|FRAG\s*=|FRAGMENT\s*=|glsl\s*`)([^`]*)`/g;

function extractShaderBodies(src) {
  // Grab every template literal that contains GLSL markers.
  const out = [];
  const re = /`([^`]*)`/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    const body = m[1];
    if (body.includes('gl_FragColor') || body.includes('gl_Position') || body.includes('#include <')) {
      out.push(body);
    }
  }
  return out;
}

for (const file of files) {
  const src = readFileSync(file, 'utf8');
  for (const body of extractShaderBodies(src)) {
    shaderCount++;
    const lineOf = (idx) => src.slice(0, idx).split('\n').length;

    // 1. smoothstep with descending literal edges
    const ss = /smoothstep\(\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*,/g;
    let m;
    while ((m = ss.exec(body)) !== null) {
      const a = parseFloat(m[1]);
      const b = parseFloat(m[2]);
      if (a > b) {
        errors.push(`${file}: smoothstep(${a}, ${b}, …) has descending edges — undefined behaviour (use smoothstep(lo, hi, x) and invert with 1.0 -)`);
      }
    }

    // 2. pow with negative literal base
    const pw = /pow\(\s*-\s*\d+(?:\.\d+)?\s*,/g;
    while ((m = pw.exec(body)) !== null) {
      errors.push(`${file}: pow(negative, y) is undefined for non-integer exponents — use exp(-q*q) instead`);
    }

    // 3. FINISH chunk required on colour-outputting fragments
    const isFragment = body.includes('gl_FragColor =');
    if (isFragment) {
      // Chunk definitions (GLSL_FINISH/DITHER sources) carry the includes themselves;
      // full shaders may reference them via ${GLSL_FINISH} interpolation.
      const isChunkDef = body.includes('#include <tonemapping_fragment');
      const hasTone = body.includes('tonemapping_fragment') || body.includes('${GLSL_FINISH}');
      const hasColor = body.includes('colorspace_fragment') || body.includes('${GLSL_FINISH}');
      if (!isChunkDef && (!hasTone || !hasColor)) {
        errors.push(
          `${file}: colour-outputting fragment shader missing ${!hasTone ? '<tonemapping_fragment> ' : ''}${!hasColor ? '<colorspace_fragment>' : ''} (FINISH chunk)`,
        );
      }
      // 4. dither warning
      const dithered = body.includes('/ 255.0') || body.includes('${GLSL_DITHER}');
      if (!dithered && body.includes('smoothstep(') && !isChunkDef) {
        warnings.push(`${file}: shader outputs gradients but has no banding dither — consider GLSL_DITHER`);
      }
    }
  }
}

console.log(`Checked ${shaderCount} shader strings in ${files.length} files.`);
for (const w of warnings) console.log(`  warn: ${w}`);
if (errors.length) {
  for (const e of errors) console.error(`  ERROR: ${e}`);
  process.exit(1);
}
console.log('Shader checks passed.');
