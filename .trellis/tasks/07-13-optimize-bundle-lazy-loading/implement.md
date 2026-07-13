# Implementation Plan

## Checklist

- [x] Confirm current `npm run build` output as a local baseline.
- [x] Move `canvg` to a dynamic import inside the raster export path.
- [x] Update `src/utils/exportDiagram.test.ts` if the mock shape changes.
- [x] Add explicit Vite `manualChunks` for stable dependency families.
- [x] Run export tests and full validation.
- [x] Inspect build output and record whether large chunk warnings remain.

## Result Notes

- Baseline build had `index` around 2,144 kB and `render` around 1,453 kB, with a Vite large chunk warning.
- Final build separates `vendor-raster-export` at around 110 kB and reduces `index` to around 795 kB.
- `render` remains around 1,453 kB and the Vite large chunk warning remains; Mermaid manual chunking was intentionally not applied because forcing all Mermaid modules into one chunk collapsed its dynamic diagram chunks and produced a much larger `vendor-mermaid` chunk.

## Validation

```bash
npm test -- --run src/utils/exportDiagram.test.ts
npm test -- --run
npm run lint
npm run build
```

If chunk or lazy-loading changes affect runtime behavior, perform a browser smoke check for SVG, PNG, JPG, and Markdown export actions.

## Risk Points

- Vitest dynamic import mocks may need adjustment.
- Over-broad manual chunking could interfere with Mermaid's dynamic module loading.
- A build warning may remain even after useful chunk separation; document that rather than hiding it.
