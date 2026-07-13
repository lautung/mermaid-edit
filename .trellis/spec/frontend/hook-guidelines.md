# Hook Guidelines

How hooks are used in this project.

## Overview

Hooks are used for browser-local state and Mermaid rendering. This project has no server data fetching layer, no React Query/SWR cache, and no API client.

## Custom Hook Patterns

- `useLocalStorage` persists string state and should remain small.
- `useJsonLocalStorage` persists typed JSON settings and must tolerate missing or invalid stored values by falling back to defaults.
- `useMermaidRenderer` owns Mermaid initialization and asynchronous rendering. Layout components consume its `{ svg, state }` result rather than calling Mermaid directly.

Keep hook parameters explicit and serializable. If a hook depends on a settings object, make sure callers update it immutably so React effects re-run predictably.

## Mermaid Rendering

`useMermaidRenderer` must:

- initialize Mermaid with `startOnLoad: false`, `securityLevel: "strict"`, configured theme/layout/curve/font, and deterministic ids
- register ELK layout support through `@mermaid-js/layout-elk`
- debounce rendering enough to keep typing usable
- invalidate stale async requests so older success or error results cannot overwrite the latest source/settings
- return structured `RenderState` values instead of throwing into components

Do not render Mermaid directly from UI components. Keep parsing and error conversion in the hook and diagnostics modules.

## Data Fetching

There is currently no network data fetching. Adding server state would be a product boundary change and needs an explicit task.

## Naming Conventions

Custom hooks use the `use*` prefix and live under `src/hooks/`. Tests should exercise behavior through the hook's public return value rather than internal refs.

## Common Mistakes

- Do not let stale Mermaid render promises update the current UI state.
- Do not parse JSON localStorage values without a fallback path.
- Do not add a global store for state that only coordinates `App.tsx` and its immediate children.
