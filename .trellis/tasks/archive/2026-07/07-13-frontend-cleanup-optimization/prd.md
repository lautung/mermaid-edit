# Clean up low-risk optimization items

## Goal

Reduce low-value frontend maintenance and render overhead before larger bundle or render-lifecycle optimization work.

This task is intentionally small: remove an unused toolbar/dependency path and avoid repeated frontmatter parsing in the settings panel without changing editor behavior, UI copy, export behavior, or Mermaid rendering semantics.

## Background

The optimization research in `docs/optimization-research.md` identified two low-risk cleanup items that can be implemented and verified independently:

- `src/components/Toolbar.tsx` is not imported by the active app and is the only source reference to `lucide-react`.
- `src/components/SettingsPanel.tsx` calls `getOverriddenKeys(source)` on every render, which reparses Mermaid frontmatter even when only zoom, filename, scale, or other non-source props change.

The repository is a browser-local Vite + React + TypeScript frontend. This task must not introduce backend state, remote accounts, server export paths, or runtime files.

## Requirements

1. Remove the unused toolbar implementation and its unused dependency.
   - Delete `src/components/Toolbar.tsx` if no active source imports it.
   - Remove `lucide-react` from `package.json` and update the lockfile consistently.
   - Do not remove Ant Design icons or any active toolbar/header UI in `src/App.tsx`.

2. Memoize settings-panel frontmatter override parsing.
   - `SettingsPanel` should recompute overridden setting keys only when `source` changes.
   - The visible override warning behavior must remain unchanged.

3. Preserve the existing optimization research artifact.
   - Keep `docs/optimization-research.md` as the source note for this task.
   - Do not stage or include runtime output, temporary files, secrets, `node_modules/`, or `dist/`.

## Acceptance Criteria

- [x] `rg "lucide-react|from \"./components/Toolbar\"|from './components/Toolbar'" src package.json` shows no active dependency or import after cleanup.
- [x] `src/components/SettingsPanel.tsx` memoizes `getOverriddenKeys(source)` with `useMemo` or an equivalent source-keyed mechanism.
- [x] Existing settings override warnings still derive from the current source text.
- [x] `npm test -- --run` passes.
- [x] `npm run lint` passes.
- [x] `npm run build` passes.
- [x] `git status --short` shows only intentional source, package/lockfile, docs, and Trellis task changes.

## Out of Scope

- Dynamic importing Mermaid, ELK, or `canvg`.
- Adding Vite `manualChunks`.
- Refactoring `App.tsx` into new components/hooks.
- Changing export behavior or adding export tests.
- Changing localStorage schema, migration, or persistence behavior.
- Updating README screenshots.

## Open Questions

None. The remaining decisions are repository-answerable and covered by the requirements above.
