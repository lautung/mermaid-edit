# State Management

How state is managed in this project.

## Overview

The app uses React local state, browser localStorage, and a narrow React Router search-param contract for shareable view state. There is no Redux, Zustand, React Query, or server state.

## State Categories

- Persistent user state:
  - Mermaid source via `useLocalStorage("mermaid-edit:source", initialDiagram)`
  - diagram settings via `useJsonLocalStorage("mermaid-edit:settings", defaultDiagramSettings)`
- Session-only UI state:
  - Markdown import modal visibility
  - template manager modal visibility
- URL view state:
  - export scale, zoom, filename, selected template type, template search text, and preview tab via `useEditorSearchParams`
  - URL state is for lightweight view restoration and sharing only
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

## URL State Contract

`useEditorSearchParams` is the only owner for editor URL query parsing and updates. Components should consume its typed return values instead of reading `window.location` or raw `URLSearchParams`.

Supported query params:

- `type`: selected template type, normalized against the current template type list.
- `q`: template search text.
- `tab`: preview tab, limited to `preview`, `export`, or `error`.
- `zoom`: preview zoom, clamped to the existing `50..200` range.
- `scale`: export scale, limited to `1`, `2`, `3`, or `4`.
- `filename`: export basename; export utilities still own sanitization and extension handling.

Do not encode Mermaid source, full diagram settings JSON, locale, modal open state, rendered SVG, or exported files into the URL. Source/settings/locale remain browser-local persistence boundaries.

High-frequency URL updates such as search text, zoom, scale, and filename should use replace-style navigation to avoid flooding browser history.

## When to Use Global State

Do not add global state for current editor workflows. Consider a global store only if future requirements add independent routes or sibling trees that need shared mutable state without a common owner.

## Server State

There is no server state. Features that require accounts, cloud storage, sharing links, or remote template sync are out of scope for the current architecture.

## Common Mistakes

- Do not duplicate Mermaid source in child component state.
- Do not treat localStorage as a server sync mechanism.
- Do not persist transient render errors, modal visibility, or export progress unless a user-facing restore requirement exists.
- Do not read raw query params in UI components; add normalization to `useEditorSearchParams` and cover it with hook tests.

## Persistence Safety

Browser localStorage is best-effort. Hooks must tolerate `getItem` / `setItem` throwing because storage may be disabled, unavailable, or over quota. Reads should fall back to the provided default, and write failures should not prevent the current React state from updating.

Typed JSON settings need a runtime boundary. Use `normalizeDiagramSettings()` when restoring `mermaid-edit:settings` so corrupt or old values fall back field-by-field before they reach Mermaid rendering or settings controls.
