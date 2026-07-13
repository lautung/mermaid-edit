# Design

## Boundaries

Primary files:

- `src/utils/exportDiagram.ts`
- `src/utils/exportDiagram.test.ts`
- `src/App.tsx` only if callers should pass basename instead of extension-bearing names

## Filename Contract

Centralize filename sanitation in export utilities. The app shell may provide a user-facing basename, but utilities should enforce safe filenames before creating download links.

Recommended shape:

- Keep `sanitizeFilename()` private unless another module has a real need.
- Add a helper that combines sanitized basename/fallback and extension.
- Preserve current fallback names: `diagram` or `mermaid-diagram` only where existing UX clearly expects them.

## Test Strategy

Use JSDOM tests to spy on anchor clicks and inspect `HTMLAnchorElement.download`, similar to current raster filename tests.

Tests should cover:

- SVG filename sanitation.
- Markdown filename sanitation.
- Blank filename fallback.

Do not add browser automation for this child unless utility-level tests cannot prove the behavior.

## Compatibility

Downloaded file contents and MIME types should not change. Only the `download` filename attribute should be normalized.
