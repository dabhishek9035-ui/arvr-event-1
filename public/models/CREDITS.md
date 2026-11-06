# Model credits

## headset.glb

- **Model:** "VR Headset"
- **Author:** J-Toastie
- **Source:** https://poly.pizza/m/raCB2tOkk3 (mirrors a Google Poly asset)
- **Licence:** CC-BY 3.0 (Creative Commons Attribution 3.0)
- **Used for:** the hero object of the AR/VR Club site (generic standalone VR headset)

**Attribution (required by CC-BY):** "VR Headset" by J-Toastie, licensed under CC-BY 3.0,
downloaded via Poly Pizza. Keep this record if the model is redistributed with the site.

**Pipeline applied:**

1. Root nodes rotated −90° around Y so the visor faces +Z (`scripts/bake_model_rotation.mjs`).
2. `npx @gltf-transform/cli optimize … --compress meshopt --texture-compress webp --texture-size 1024`
   (108 KB → 22.5 KB, meshopt compression; decoded at runtime by three's MeshoptDecoder).
3. Verified with `npm run report:model` (triangles, materials, bounds, budgets).

**Alternatives evaluated and rejected:** "VR Headset" by jeremy (poly.pizza/m/bvd33G7Q66m,
CC-BY 3.0 — too dark for the dark theme) and "VR HMD" by Michael Fuchs
(poly.pizza/m/5v7UsPt7bIA, CC-BY 3.0 — visor box only, not recognisable as a headset).
