# Model credits

## headset.glb

- **Model:** Owner-supplied VR headset scan (Meta Quest-style, photogrammetry-grade)
- **Provenance:** Supplied directly by the AR/VR Club owner (file
  `7725bbe1417eb2fbdc35d33a1f79b9c6.glb`, 2026-11-07). Source site and licence were
  **not stated** — the owner should confirm the licence before public redistribution.
- **Used for:** the hero object of the AR/VR Club site

**Pipeline applied:**

1. `scripts/prepare_owner_model.mjs` — weld (topology merge, full **592,720 triangles**
   retained at the owner's request) → assigned near-black charcoal PBR material
   (linear 0.016/0.016/0.02, metal 0.1, roughness 0.5 — the source mesh had none).
   No rotation: the scan's visor natively faces +Z.
2. `npx @gltf-transform/cli optimize … --compress meshopt --simplify false`
   (10.67 MB → 1.79 MB; no simplification).
3. Verified with `npm run report:model` (two intentional budget overrides:
   triangles 592,720 and file 1.79 MB — owner-requested full resolution) and
   visually in the scene.

**Performance note:** the full-resolution mesh is fine on desktop GPUs; on low-end
mobile it may drop below the 30 fps target since geometry is not tiered.

---

## Previous hero (replaced 2026-11-07)

- **Model:** "VR Headset" by J-Toastie — CC-BY 3.0,
  https://poly.pizza/m/raCB2tOkk3 (mirrors a Google Poly asset).
- Available in git history (commit `003d578` and the asset's original download) if
  the owner-supplied model ever needs to be swapped back.
- Alternatives evaluated at the time: "VR Headset" by jeremy (poly.pizza/m/bvd33G7Q66m,
  CC-BY 3.0) and "VR HMD" by Michael Fuchs (poly.pizza/m/5v7UsPt7bIA, CC-BY 3.0).
