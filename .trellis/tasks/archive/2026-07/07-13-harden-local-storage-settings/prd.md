# Harden local storage and settings migration

## Goal

Make browser-local persistence tolerant of unavailable localStorage, bad JSON, quota failures, old settings, and manually corrupted values.

## Evidence

- `src/hooks/useLocalStorage.ts` directly calls `window.localStorage.getItem()` and `setItem()`.
- `src/hooks/useJsonLocalStorage.ts` catches JSON parse failures but not localStorage read/write exceptions.
- `useJsonLocalStorage<T>` returns parsed JSON as `T` without runtime normalization.
- `src/data/settings.ts` defines `defaultDiagramSettings`, but there is no settings migration/normalization function.
- `DiagramSettings` is a TypeScript union, but localStorage can contain invalid runtime values.

## Requirements

- String persistence should fall back safely when localStorage reads throw.
- String persistence should not crash the app when writes throw.
- JSON persistence should fall back safely when localStorage is unavailable or contains invalid JSON.
- Diagram settings restored from storage should be normalized to valid `DiagramSettings` values.
- Unknown or invalid settings values should fall back to `defaultDiagramSettings` field-by-field where possible.
- Tests must cover read exceptions, write exceptions, invalid JSON, and invalid settings values.

## Acceptance Criteria

- [ ] `useLocalStorage` does not throw when localStorage get/set fails.
- [ ] `useJsonLocalStorage` does not throw when localStorage get/set fails.
- [ ] Invalid JSON falls back to the provided fallback.
- [ ] Invalid persisted diagram settings are normalized before reaching Mermaid rendering or settings controls.
- [ ] Focused hook/settings tests cover the failure cases.

## Out of Scope

- Server sync, account storage, or URL persistence.
- Adding a validation library unless explicit hand-written normalization becomes unmanageable.
- Persisting transient UI state such as modals or render errors.
