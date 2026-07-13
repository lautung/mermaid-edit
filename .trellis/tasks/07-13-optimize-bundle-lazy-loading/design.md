# Design

## Boundaries

Primary files:

- `src/utils/exportDiagram.ts`
- `src/utils/exportDiagram.test.ts`
- `vite.config.ts`
- `package.json` only if a dependency is proven unused

Do not change app shell layout or user-facing export controls in this task.

## Dependency Loading

Change raster export from:

```ts
import { Canvg } from "canvg";
```

to a local dynamic import inside the raster rendering path. Keep the dynamic import narrow so SVG and Markdown export users do not load the raster dependency.

Tests should continue mocking `canvg`; update mocks only as needed for dynamic import behavior.

## Chunk Strategy

Use `build.rollupOptions.output.manualChunks` to group obvious dependency families without fighting Mermaid's internal dynamic imports:

- Ant Design and icon dependencies.
- CodeMirror dependencies.
- Mermaid and Mermaid layout dependencies.
- Raster export dependencies such as `canvg`.

Avoid brittle path checks tied to generated asset names. Use package-name checks from module ids.

## Compatibility

Mermaid already uses dynamic chunks internally. Manual chunks must not merge or rename assumptions into code. The browser should still be able to load dynamic Mermaid diagram modules and recover through the existing chunk-load retry path.

## Tradeoffs

Manual chunking improves cache and inspection boundaries, but it may not eliminate every large chunk because Mermaid ships substantial diagram implementations. The target is practical loading separation, not an artificial zero-warning build.
