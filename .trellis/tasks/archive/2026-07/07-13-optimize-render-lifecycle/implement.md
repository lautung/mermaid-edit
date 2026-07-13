# Implementation Plan

## Checklist

- [x] Add or adjust tests to prove locale-only changes do not call `mermaid.render()`.
- [x] Split Mermaid initialization from render scheduling.
- [x] Add locale reconciliation for idle/ready/error messages.
- [x] Preserve chunk retry and stale request tests.
- [x] Run targeted hook tests and full validation.

## Result Notes

- `useMermaidRenderer` now initializes Mermaid from settings separately from render scheduling.
- Render requests depend on source and settings, while locale message changes relabel current render state without starting a new Mermaid render.
- Existing syntax diagnostics are rederived from the last parse error when locale changes.
- Targeted hook tests now cover settings changes, locale-only ready-state relabeling, and locale-only syntax diagnostic relabeling.

## Validation

```bash
npm test -- --run src/hooks/useMermaidRenderer.test.tsx
npm test -- --run
npm run lint
npm run build
```

Browser smoke checks are useful if the hook contract changes in a way that touches `App.tsx`: valid render, invalid render diagnostics, language switch, and ELK layout.

## Risk Points

- Re-localizing diagnostics without rerendering requires retaining enough error context.
- Settings object identity can still trigger effects if callers mutate or recreate it incorrectly; tests should use realistic rerenders.
- Splitting effects must not allow old async renders to restore stale SVG or errors.
