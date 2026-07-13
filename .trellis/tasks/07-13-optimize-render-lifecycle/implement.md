# Implementation Plan

## Checklist

- [ ] Add or adjust tests to prove locale-only changes do not call `mermaid.render()`.
- [ ] Split Mermaid initialization from render scheduling.
- [ ] Add locale reconciliation for idle/ready/error messages.
- [ ] Preserve chunk retry and stale request tests.
- [ ] Run targeted hook tests and full validation.

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
