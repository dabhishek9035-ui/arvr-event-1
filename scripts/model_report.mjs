#!/usr/bin/env node
/**
 * Model report (plan §6.1 pipeline): triangles, materials, bounds, size,
 * extensions — with budget warnings. Needs @gltf-transform/core.
 *
 * Usage: node scripts/model_report.mjs public/models/headset.glb
 */
import { NodeIO } from '@gltf-transform/core';
import { EXTMeshoptCompression, EXTTextureWebP, KHRMeshQuantization } from '@gltf-transform/extensions';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { statSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// resolve 'three' from the project root (script lives in <root>/scripts)
const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)));

const file = process.argv[2];
if (!file) {
  console.error('usage: node scripts/model_report.mjs <model.glb>');
  process.exit(1);
}

const MAX_TRIS = 60_000;
const MAX_MATERIALS = 3;
const MAX_BYTES = 1_500_000;

const io = new NodeIO()
  .registerExtensions([EXTMeshoptCompression, EXTTextureWebP, KHRMeshQuantization])
  .registerDependencies({ 'meshopt.decoder': MeshoptDecoder });
let doc;
try {
  doc = await io.read(resolve(file));
} catch (e) {
  console.error(`Failed to read ${file}: ${e.message}`);
  process.exit(1);
}

const root = doc.getRoot();
let tris = 0;
let prims = 0;
let min = [Infinity, Infinity, Infinity];
let max = [-Infinity, -Infinity, -Infinity];

for (const mesh of root.listMeshes()) {
  for (const prim of mesh.listPrimitives()) {
    prims++;
    const indices = prim.getIndices();
    const position = prim.getAttribute('POSITION');
    if (position) {
      const mn = position.getMin(new Array(3));
      const mx = position.getMax(new Array(3));
      if (mn && mx) {
        for (let i = 0; i < 3; i++) {
          min[i] = Math.min(min[i], mn[i]);
          max[i] = Math.max(max[i], mx[i]);
        }
      }
    }
    const count = indices ? indices.getCount() : (position?.getCount() ?? 0);
    if (prim.getMode() === 4) tris += count / 3; // TRIANGLES
  }
}

const materials = root.listMaterials().length;
const textures = root.listTextures().length;
const bytes = statSync(file).size;
const size = max.map((v, i) => +(v - min[i]).toFixed(3));

console.log(`Model: ${file}`);
console.log(`  triangles : ${Math.round(tris).toLocaleString()} across ${prims} primitives`);
console.log(`  materials : ${materials}`);
console.log(`  textures  : ${textures}`);
console.log(`  bounds    : ${size.join(' × ')} units (pre-transform approximation)`);
console.log(`  file size : ${(bytes / 1024).toFixed(0)} KB`);

const extensions = root.listExtensionsUsed().map((e) => e.extensionName);
if (extensions.length) console.log(`  extensions: ${extensions.join(', ')}`);

const warnings = [];
if (tris > MAX_TRIS) warnings.push(`triangles ${Math.round(tris).toLocaleString()} > budget ${MAX_TRIS.toLocaleString()}`);
if (materials > MAX_MATERIALS) warnings.push(`materials ${materials} > budget ${MAX_MATERIALS}`);
if (bytes > MAX_BYTES) warnings.push(`file ${(bytes / 1024).toFixed(0)} KB > budget ${(MAX_BYTES / 1024).toFixed(0)} KB`);

if (warnings.length) {
  for (const w of warnings) console.warn(`  WARN: ${w}`);
} else {
  console.log('  All budgets OK.');
}
