# Frontend Development Guidelines

This repository is a browser-local Mermaid editor built with Vite, React, TypeScript, Ant Design, CodeMirror, Mermaid, `@mermaid-js/layout-elk`, and `canvg`.

There is no backend layer in this project. Do not introduce server state, database rules, API clients, or server-side export paths unless a future task explicitly changes the product boundary.

## Pre-Development Checklist

Before editing frontend code or docs that describe frontend behavior:

1. Read this index and the specific guide for the files you will touch.
2. Check `package.json` for the current validation commands.
3. Search for existing helpers before adding a new component, hook, type, template, parser, or export utility.
4. Keep browser-local data boundaries explicit: source, settings, rendering, and exports stay client-side.

## Guidelines Index

| Guide | Description |
|-------|-------------|
| [Directory Structure](./directory-structure.md) | Source layout, docs assets, and where new modules belong |
| [Component Guidelines](./component-guidelines.md) | React component contracts, Ant Design usage, CodeMirror wrapper rules |
| [Hook Guidelines](./hook-guidelines.md) | Custom hook responsibilities and async Mermaid rendering rules |
| [State Management](./state-management.md) | Local state, localStorage persistence, and derived UI state |
| [Quality Guidelines](./quality-guidelines.md) | Tests, lint/build checks, browser smoke checks, and forbidden patterns |
| [Type Safety](./type-safety.md) | Shared TypeScript types, unions, runtime parsing boundaries |

## Current Runtime Boundaries

- `src/App.tsx` coordinates layout, user actions, settings, template selection, and export commands.
- `src/hooks/useMermaidRenderer.ts` owns Mermaid initialization, parsing, rendering, async request ordering, and render state.
- `src/components/MermaidCodeEditor.tsx` is the only CodeMirror lifecycle owner.
- `src/utils/exportDiagram.ts` owns SVG, raster, clipboard, and Markdown downloads.
- `src/data/examples.ts` owns bundled template metadata and Mermaid source.
- `src/diagnostics/` owns parser-error interpretation and safe repair suggestions.

## Required Validation

Run these before reporting frontend or docs work complete when the working tree has relevant changes:

```bash
npm test -- --run
npm run lint
npm run build
```

For user-facing layout or screenshot changes, also verify the real app in Chrome at a desktop viewport and a narrow/mobile viewport.
