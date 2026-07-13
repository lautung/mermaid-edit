# Design

## Boundaries

Primary files:

- `src/hooks/useLocalStorage.ts`
- `src/hooks/useJsonLocalStorage.ts`
- `src/data/settings.ts`
- New focused tests beside the hook/settings modules
- `src/App.tsx` only if the hook API needs an optional normalize parameter

## Safe Storage

Introduce a small browser-local wrapper for storage operations or keep try/catch inside hooks if no other caller needs it.

Required behavior:

- `getItem` exceptions return fallback.
- `setItem` exceptions are swallowed because persistence is best-effort.
- The in-memory React state should still update even when persistence fails.

## Settings Normalization

Add a focused function near `defaultDiagramSettings`, for example:

```ts
normalizeDiagramSettings(value: unknown): DiagramSettings
```

It should validate allowed values for `theme`, `layout`, `curve`, `fontFamily`, and `background`. Background may accept `"transparent"` or valid CSS hex-like values already produced by the color input; unsafe arbitrary values should fall back.

## Hook API

Preferred approach: keep `useJsonLocalStorage<T>` generic but allow an optional normalize function:

```ts
useJsonLocalStorage<T>(key, fallback, normalize?)
```

This keeps generic JSON storage reusable while giving settings a runtime boundary.

## Compatibility

Existing storage keys must remain the same:

- `mermaid-edit:source`
- `mermaid-edit:settings`
- `mermaid-edit:locale`

Do not clear existing valid user data.
