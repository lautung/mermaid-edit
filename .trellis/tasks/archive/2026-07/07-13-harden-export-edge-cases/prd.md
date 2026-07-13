# Harden export edge cases

## Goal

Finish export-path consistency and failure-path coverage, building on the existing `svgDimensions` utility and export tests already present in the current checkout.

## Evidence

- `src/utils/svgDimensions.ts` exists and is already used by `src/utils/exportDiagram.ts`.
- `src/utils/exportDiagram.test.ts` already covers comma and whitespace `viewBox`, fallback dimensions, JPEG white background, raster filename sanitation, missing SVG root, missing Canvas context, and `toBlob(null)`.
- `downloadRaster()` sanitizes filenames.
- `downloadSvg()` and `downloadMarkdown()` currently accept filenames directly from callers.
- `App.tsx` builds SVG and Markdown filenames separately, so filename behavior can drift across export formats.

## Requirements

- SVG, PNG, JPG, and Markdown downloads should use consistent filename fallback and invalid-character sanitation.
- Existing raster export behavior must continue to use `canvg` directly.
- Export utilities should keep browser-only responsibilities and not depend on app shell UI.
- Tests should cover remaining consistency gaps without duplicating already-covered cases.

## Acceptance Criteria

- [ ] SVG download filenames are sanitized consistently with raster filenames.
- [ ] Markdown download filenames use the same invalid-character handling.
- [ ] Existing raster tests continue to pass.
- [ ] New tests cover SVG and Markdown filename behavior through public export utility functions.
- [ ] No server-side export path or `Image -> Canvas` raster path is introduced.

## Out of Scope

- Redesigning export UI.
- Changing the existing SVG/PNG/JPG/Markdown format set.
- Adding cloud or server export.
