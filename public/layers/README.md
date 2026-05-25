# Scene layer images

Drop your artwork here and keep the filenames below (or edit `src/app/layerAssets.ts`).

| File | Used for |
|------|----------|
| `forest-bg.png` | Full-bleed forest / valley background (portrait; `object-cover`) |
| `river-bg.png` | Full-bleed winding river overlay (`mix-blend-screen` knocks out pure black mats; prefer true alpha when exporting) |
| `house.png` | Both Bride’s and Groom’s homes |
| `flower1.png` | Engagement milestone |
| `flower2.png` | Mandap milestone |
| `flower3.png` | Mehendi milestone |
| `boat.png` | Boat only (no separate bride UI) |

You can temporarily point all three `flowers` entries in `layerAssets.ts` at the same file while you’re still gathering assets.

Suggested sizes (flexible):

- Forest background: portrait ~900×1600px or larger
- River: portrait to match frame
- Flowers / boat: 256–512px transparent PNGs work well

The repo may include colorful **placeholders** for overlays; replace them with your final graphics.
