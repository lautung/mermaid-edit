# Optimize bundle and lazy dependency loading

## Goal

Reduce first-load JavaScript cost and make heavy dependency boundaries explicit, without changing the static frontend architecture or export behavior.

## Evidence

- `docs/optimization-research.md` reports large Vite chunks, including the main entry and Mermaid-related render chunks.
- `src/utils/exportDiagram.ts` statically imports `Canvg`, even though raster export is needed only for PNG/JPG actions.
- `src/hooks/useMermaidRenderer.ts` statically imports `mermaid` and `@mermaid-js/layout-elk`, then registers ELK at module load.
- `vite.config.ts` currently does not define explicit `manualChunks`.
- `lucide-react` and the old unused toolbar cleanup are already complete in the current checkout and are not part of this child task.

## Requirements

- Raster export must load `canvg` only when PNG/JPG export is requested.
- SVG and Markdown export must not require `canvg`.
- Vite chunk boundaries should make major vendor groups easier to cache and inspect, especially Ant Design, CodeMirror, Mermaid, and raster export dependencies.
- Mermaid rendering and ELK layout support must continue to work after chunk changes.
- The app must remain fully static and browser-local.

## Acceptance Criteria

- [ ] `canvg` is no longer in the main static import path for `src/utils/exportDiagram.ts`.
- [ ] PNG/JPG exports still render through `canvg` and existing export tests pass.
- [ ] Vite build succeeds with explicit chunk grouping or a documented reason for not applying a group.
- [ ] The build output is easier to inspect by dependency family than the baseline default chunking.
- [ ] No backend, worker service, or remote export path is introduced.

## Out of Scope

- Removing Mermaid or ELK support.
- Replacing Ant Design or CodeMirror.
- Hiding Vite warnings by only raising `chunkSizeWarningLimit`.
