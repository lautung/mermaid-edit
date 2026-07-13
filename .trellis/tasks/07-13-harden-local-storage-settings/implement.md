# Implementation Plan

## Checklist

- [ ] Add focused tests for safe string localStorage read/write behavior.
- [ ] Add focused tests for JSON read/write exceptions and invalid JSON fallback.
- [ ] Add `normalizeDiagramSettings()` and tests for invalid field values.
- [ ] Wire settings persistence through normalization.
- [ ] Run targeted and full validation.

## Validation

```bash
npm test -- --run src/hooks
npm test -- --run src/data
npm test -- --run
npm run lint
npm run build
```

## Risk Points

- Overly strict background validation could discard valid user-selected colors.
- Swallowing write failures should not hide state updates in the current session.
- Hook tests need to isolate localStorage spies and cleanup between cases.
