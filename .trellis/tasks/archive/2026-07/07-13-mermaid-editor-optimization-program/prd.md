# Mermaid editor optimization program

## Goal

Coordinate the optimization work described in `docs/optimization-research.md` as independently verifiable child tasks, while preserving the current browser-local Mermaid editor product boundary.

## Confirmed Facts

- The app is a static frontend built with Vite, React, TypeScript, Ant Design, CodeMirror, Mermaid, `@mermaid-js/layout-elk`, and `canvg`.
- There is no backend, database, login state, server API, or server-side export path.
- Current validation commands are `npm test -- --run`, `npm run lint`, and `npm run build`.
- Some optimization document items are already partially complete in the current checkout:
  - `lucide-react` is not present in `package.json`.
  - `src/components/Toolbar.tsx` is not present.
  - `src/utils/svgDimensions.ts` and `src/utils/exportDiagram.test.ts` already exist.
  - `src/components/SettingsPanel.tsx` already memoizes frontmatter override parsing.
- Remaining optimization work should follow the live code, not stale assumptions from the research document.

## Child Task Map

1. `07-13-optimize-bundle-lazy-loading` (P0)
   Reduce initial bundle pressure through lazy dependency loading and explicit chunk boundaries.
2. `07-13-optimize-render-lifecycle` (P0)
   Avoid locale-only re-render work while preserving Mermaid settings behavior and localized diagnostics.
3. `07-13-harden-export-edge-cases` (P1)
   Finish export consistency and failure-path coverage not already handled by the existing export tests.
4. `07-13-harden-local-storage-settings` (P1)
   Add safe persistence and runtime normalization for settings restored from localStorage.
5. `07-13-split-app-component-responsibilities` (P1)
   Reduce `App.tsx` responsibility concentration through focused extraction without changing workflows.

## Requirements

- Each child task must be independently startable, implementable, testable, and archivable.
- P0 children should be implemented before P1 children unless the user explicitly changes priority.
- Parent-level completion requires all child tasks to be either completed or intentionally deferred with a recorded reason.
- No child task may introduce backend state, remote accounts, server export, runtime secrets, or generated build artifacts into git.
- Browser-local export behavior must remain SVG / PNG / JPG / Markdown, with PNG/JPG rendered through `canvg` rather than `Image -> Canvas`.

## Acceptance Criteria

- [x] The task tree contains one parent and five children mapped to the remaining optimization themes.
- [x] Each child task has a focused `prd.md`, `design.md`, and `implement.md`.
- [x] The parent task records cross-child ordering and final integration criteria.
- [x] The final program-level verification plan includes `npm test -- --run`, `npm run lint`, `npm run build`, and real-browser smoke checks when UI/export behavior changes.

## Out of Scope

- Adding backend services, cloud sync, accounts, sharing URLs, or server-side rendering/export.
- Replacing the editor technology stack.
- Rewriting the visual design or README screenshots unless a child task changes user-facing UI enough to require new screenshots.
