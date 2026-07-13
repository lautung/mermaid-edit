# Implementation Plan

## Checklist

- [ ] Add utility tests for SVG and Markdown filename sanitation/fallback.
- [ ] Refactor export filename construction to share sanitation logic.
- [ ] Keep raster filename tests passing.
- [ ] Review `App.tsx` export callers for duplicated extension/fallback logic.
- [ ] Run targeted and full validation.

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
