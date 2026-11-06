# Model credits

## headset.glb

- **Model:** Owner-supplied VR headset scan (Meta Quest-style, photogrammetry-grade)
- **Provenance:** Supplied directly by the AR/VR Club owner (file
  `7725bbe1417eb2fbdc35d33a1f79b9c6.glb`, 2026-11-07). Source site and licence were
  **not stated** — the owner should confirm the licence before public redistribution.
- **Used for:** the hero object of the AR/VR Club site

**Pipeline applied:**

1. `scripts/prepare_owner_model.mjs` — weld → simplify 592,720 → 41,490 triangles
   (meshopt simplifier, ratio 0.07, error 0.05) → assigned neutral studio-grey PBR
   material (the source mesh had none) → root nodes rotated 180° around Y so the
   visor faces +Z.
2. `npx @gltf-transform/cli optimize … --compress meshopt --texture-compress webp`
   (498 KB → 138 KB).
3. Verified with `npm run report:model` (all budgets OK) and visually in the scene.

---

## Previous hero (replaced 2026-11-07)

- **Model:** "VR Headset" by J-Toastie — CC-BY 3.0,
  https://poly.pizza/m/raCB2tOkk3 (mirrors a Google Poly asset).
- Available in git history (commit `003d578` and the asset's original download) if
  the owner-supplied model ever needs to be swapped back.
- Alternatives evaluated at the time: "VR Headset" by jeremy (poly.pizza/m/bvd33G7Q66m,
  CC-BY 3.0) and "VR HMD" by Michael Fuchs (poly.pizza/m/5v7UsPt7bIA, CC-BY 3.0).
