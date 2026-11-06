#!/usr/bin/env node
/**
 * Prepares the owner-supplied headset GLB for the hero slot (§6.1 pipeline):
 * weld → simplify to a target ratio → assign a neutral PBR material (the
 * source has none) → optionally bake a Y rotation so the visor faces +Z.
 *
 * Usage:
 *   node scripts/prepare_owner_model.mjs <in.glb> <out.glb> [--ratio 0.08] [--rot-deg -90]
 */
import { NodeIO } from '@gltf-transform/core';
import { EXTMeshoptCompression, EXTTextureWebP, KHRMeshQuantization } from '@gltf-transform/extensions';
import { weld, simplify } from '@gltf-transform/functions';
import { MeshoptDecoder, MeshoptSimplifier } from 'meshoptimizer';
import * as THREE from 'three';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const [inArg, outArg] = process.argv.slice(2);
if (!inArg || !outArg) {
  console.error('usage: node scripts/prepare_owner_model.mjs <in.glb> <out.glb> [--ratio 0.08] [--rot-deg -90]');
  process.exit(1);
}
const args = process.argv.slice(3);
const getArg = (name, dflt) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] !== undefined ? parseFloat(args[i + 1]) : dflt;
};
const ratio = getArg('--ratio', 0.08);
const targetError = getArg('--err', 0.02);
const rotDeg = args.includes('--rot-deg') ? getArg('--rot-deg', -90) : null;

const inPath = resolve(process.cwd(), inArg);
const outPath = resolve(process.cwd(), outArg);

const io = new NodeIO()
  .registerExtensions([EXTMeshoptCompression, EXTTextureWebP, KHRMeshQuantization])
  .registerDependencies({ 'meshopt.decoder': MeshoptDecoder });

const doc = await io.read(inPath);

// 1. weld + simplify (592k tris is far over the 60k hero budget)
await doc.transform(weld());
await MeshoptSimplifier.ready;
await doc.transform(simplify({ simplifier: MeshoptSimplifier, ratio, error: targetError }));

// 2. the source has no material — give it a mid-dark studio-grey PBR surface
//    (linear-space factors; ~sRGB 0.35 grey so it holds up under the strong rig)
const material = doc.createMaterial('HeadsetMat');
material.setBaseColorFactor([0.16, 0.17, 0.2, 1.0]);
material.setMetallicFactor(0.0);
material.setRoughnessFactor(0.62);
for (const mesh of doc.getRoot().listMeshes()) {
  for (const prim of mesh.listPrimitives()) {
    prim.setMaterial(material);
  }
}

// 3. bake a Y rotation so the visor faces +Z (asset spec §6.1)
if (rotDeg !== null) {
  const scene = doc.getRoot().listScenes()[0];
  const q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), (rotDeg * Math.PI) / 180);
  for (const node of scene.listChildren()) {
    const r = node.getRotation();
    const qNode = new THREE.Quaternion(r[0], r[1], r[2], r[3]);
    const qFinal = q.clone().multiply(qNode);
    node.setRotation([qFinal.x, qFinal.y, qFinal.z, qFinal.w]);
  }
}

await io.write(outPath, doc);

// report
const outDoc = await io.read(outPath);
let tris = 0;
for (const mesh of outDoc.getRoot().listMeshes()) {
  for (const prim of mesh.listPrimitives()) {
    const indices = prim.getIndices();
    const position = prim.getAttribute('POSITION');
    tris += (indices ? indices.getCount() : position?.getCount() ?? 0) / 3;
  }
}
console.log(`written: ${outPath}`);
console.log(`triangles now: ${Math.round(tris).toLocaleString()} (target ratio ${ratio})`);
