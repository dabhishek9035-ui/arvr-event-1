import { NodeIO } from '@gltf-transform/core';
import * as THREE from 'three';

// Rotate the headset so the visor faces +Z (asset spec §6.1): native front is +X.
const [inPath, outPath] = process.argv.slice(2);
const io = new NodeIO();
const doc = await io.read(inPath);
const scene = doc.getRoot().listScenes()[0];
const q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI / 2);
for (const node of scene.listChildren()) {
  const r = node.getRotation();
  const qNode = new THREE.Quaternion(r[0], r[1], r[2], r[3]);
  const qFinal = q.clone().multiply(qNode);
  node.setRotation([qFinal.x, qFinal.y, qFinal.z, qFinal.w]);
}
await io.write(outPath, doc);
console.log('baked -90° Y rotation →', outPath);
