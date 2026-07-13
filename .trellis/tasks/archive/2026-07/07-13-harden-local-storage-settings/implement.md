# Implementation Plan

## Checklist

- [x] Add focused tests for safe string localStorage read/write behavior.
- [x] Add focused tests for JSON read/write exceptions and invalid JSON fallback.
- [x] Add `normalizeDiagramSettings()` and tests for invalid field values.
- [x] Wire settings persistence through normalization.
- [x] Run targeted and full validation.

## Result Notes

- `useLocalStorage` and `useJsonLocalStorage` now treat localStorage reads/writes as best-effort and preserve in-memory state when writes fail.
- `useJsonLocalStorage` accepts an optional normalize function for runtime boundaries.
- `normalizeDiagramSettings()` validates settings restored from localStorage field-by-field.
- Added focused hook tests with a fake `window.localStorage` because this Vitest/jsdom environment does not provide a complete Storage implementation.

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
