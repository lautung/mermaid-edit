# Directory Structure

How frontend code and documentation assets are organized in this project.

## Overview

The app is a single Vite/React frontend. Keep product code under `src/`, public runtime assets under `public/`, and documentation-only assets under `docs/`.

## Directory Layout

```text
src/
├── App.tsx
├── main.tsx
├── styles.css
├── types.ts
├── components/
├── data/
├── diagnostics/
├── hooks/
└── utils/

docs/
├── screenshots/
├── design-assets/
└── superpowers/

public/
└── favicon.svg
```

## Source Modules

- `components/` contains React UI components. Components may compose Ant Design controls, but browser integrations should stay in focused wrappers such as `MermaidCodeEditor`.
- `data/` contains bundled static data such as Mermaid templates and default settings. Templates are data, not component branches.
- `diagnostics/` contains Mermaid syntax diagnostic derivation and repair-rule metadata.
- `hooks/` contains reusable stateful logic such as localStorage persistence and Mermaid rendering.
- `utils/` contains pure or browser-bound utilities such as Markdown fence parsing and file export.
- `types.ts` contains shared unions and data contracts used across modules.

## Documentation Assets

- README screenshots belong in `docs/screenshots/`.
- Design references and historical design artifacts belong in `docs/design-assets/`.
- Do not put README screenshots in `public/`; `public/` is for runtime assets loaded by the app.

## Naming Conventions

- React components use `PascalCase.tsx`.
- Hooks use `useSomething.ts`.
- Utilities and data modules use `camelCase.ts`.
- Tests live next to the unit under test as `*.test.ts` or `*.test.tsx`.
- CSS class names are stable semantic names in `src/styles.css`; avoid generated or component-library-internal class targeting unless there is no stable wrapper.

## Examples

- `src/components/MermaidCodeEditor.tsx` is the model for isolating an imperative browser library behind a controlled React API.
- `src/hooks/useMermaidRenderer.ts` is the model for async browser rendering with stale-request protection.
- `src/utils/exportDiagram.ts` is the model for browser-only download utilities.
