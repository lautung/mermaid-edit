# Harden export SVG sizing

## Goal

Make SVG dimension handling consistent between preview and raster export, and add focused tests around browser-local export failure paths before later bundle-splitting work touches `canvg`.

## Background

`docs/optimization-research.md` identifies this as the next optimization step after the initial cleanup:

- `src/utils/exportDiagram.ts` has no direct tests.
- `src/utils/exportDiagram.ts` parses `viewBox` with whitespace-only splitting, so comma-separated `viewBox` values can fall back to default dimensions during PNG/JPG export.
- `src/components/PreviewPane.tsx` parses `viewBox` with whitespace-or-comma splitting, so preview and export can disagree about the same SVG.
- PNG/JPG export must keep using `canvg` to render SVG directly onto Canvas; the project must not return to an `Image -> Canvas` raster path.

The repository is a browser-local Vite + React + TypeScript app. Export work remains client-side only.

## Requirements

1. Share SVG dimension parsing between preview and export.
   - Add a small utility under `src/utils/` for SVG dimension parsing, or otherwise reuse one implementation.
   - Support `viewBox` values separated by spaces, commas, or mixed whitespace/commas.
   - Preserve existing fallback behavior: preview returns no explicit surface dimensions when dimensions are unavailable; export falls back to safe default dimensions for raster output.

2. Keep raster export behavior unchanged except for fixed dimension parsing.
   - Continue using `canvg` directly for SVG-to-Canvas rasterization.
   - Keep PNG transparent background behavior.
   - Keep JPG transparent background converting to white.
   - Keep existing user-facing error messages for missing SVG, unsupported Canvas, and failed image export unless a test exposes a clearer existing mismatch.

3. Add focused export tests.
   - Cover comma-separated and whitespace-separated `viewBox` parsing.
   - Cover fallback dimensions when SVG lacks usable dimensions.
   - Cover JPG transparent background filling white.
   - Cover invalid filename sanitization for raster exports.
   - Cover missing `<svg>`, `canvas.getContext()` returning null, and `canvas.toBlob(null)`.
   - Mock `canvg` and browser download APIs rather than performing real downloads.

4. Avoid unrelated optimization work.
   - Do not dynamically import `canvg` in this task.
   - Do not add Vite manual chunking.
   - Do not refactor `App.tsx` export actions.
   - Do not change UI layout, README screenshots, or i18n text.

## Acceptance Criteria

- [x] `src/components/PreviewPane.tsx` and `src/utils/exportDiagram.ts` no longer maintain conflicting SVG dimension parsing logic.
- [x] `src/utils/exportDiagram.test.ts` or equivalent focused tests cover the export boundary cases listed above.
- [x] PNG/JPG export still routes SVG through `canvg`, not `Image -> Canvas`.
- [x] `npm test -- --run` passes.
- [x] `npm run lint` passes.
- [x] `npm run build` passes.
- [x] `git status --short` shows only intentional source/test, frontend spec, and Trellis task changes.

## Out of Scope

- Bundle splitting, lazy loading, or `manualChunks`.
- Mermaid render lifecycle changes.
- localStorage hardening.
- `App.tsx` component boundary refactors.
- Browser smoke screenshot refreshes.

## Open Questions

None. The remaining decisions are repository-answerable and covered by the requirements above.
