# Implementation Plan

## Checklist

- [x] Add utility tests for SVG and Markdown filename sanitation/fallback.
- [x] Refactor export filename construction to share sanitation logic.
- [x] Keep raster filename tests passing.
- [x] Review `App.tsx` export callers for duplicated extension/fallback logic.
- [x] Run targeted and full validation.

## Result Notes

- `downloadSvg`, `downloadRaster`, and `downloadMarkdown` now share filename formatting through one private helper.
- `App.tsx` passes the user-facing basename instead of constructing per-format filenames.
- Export tests now cover SVG/Markdown sanitization, blank fallbacks, and duplicate-extension prevention in addition to existing raster edge cases.

## Validation

```bash
npm test -- --run src/utils/exportDiagram.test.ts
npm test -- --run
npm run lint
npm run build
```

## Risk Points

- Changing whether callers include extensions can accidentally produce duplicate extensions.
- Markdown currently uses a different fallback in `App.tsx`; preserve user-visible intent or explicitly normalize it.
