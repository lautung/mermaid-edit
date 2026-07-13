# State Management

How state is managed in this project.

## Overview

The app uses React local state and browser localStorage. There is no Redux, Zustand, React Query, server state, or URL-state contract.

## State Categories

- Persistent user state:
  - Mermaid source via `useLocalStorage("mermaid-edit:source", initialDiagram)`
  - diagram settings via `useJsonLocalStorage("mermaid-edit:settings", defaultDiagramSettings)`
- Session-only UI state:
  - export scale, zoom, filename, selected template type, template search text
  - Markdown import modal visibility
  - template manager modal visibility
- Derived state:
  - `canExport` from render state and SVG presence
  - filtered template list from selected type and search keyword
  - active template from source equality
- Render state:
  - `{ svg, state }` from `useMermaidRenderer`

## Ownership Rules

- `App.tsx` owns cross-panel state and user action handlers.
- Components receive controlled props and callbacks. Do not let a child component write localStorage or mutate shared state directly unless it is a focused persistence hook.
- Rendered SVG is hook output, not persistent application state.
- Template metadata is static data from `src/data/examples.ts`.

## When to Use Global State

Do not add global state for current editor workflows. Consider a global store only if future requirements add independent routes or sibling trees that need shared mutable state without a common owner.

## Server State

There is no server state. Features that require accounts, cloud storage, sharing links, or remote template sync are out of scope for the current architecture.

## Common Mistakes

- Do not duplicate Mermaid source in child component state.
- Do not treat localStorage as a server sync mechanism.
- Do not persist transient render errors, modal visibility, or export progress unless a user-facing restore requirement exists.

## Persistence Safety

Browser localStorage is best-effort. Hooks must tolerate `getItem` / `setItem` throwing because storage may be disabled, unavailable, or over quota. Reads should fall back to the provided default, and write failures should not prevent the current React state from updating.

Typed JSON settings need a runtime boundary. Use `normalizeDiagramSettings()` when restoring `mermaid-edit:settings` so corrupt or old values fall back field-by-field before they reach Mermaid rendering or settings controls.
