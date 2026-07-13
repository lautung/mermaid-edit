# React Router URL State Optimization

## Goal

Introduce React Router as a minimal library-mode routing layer and make selected lightweight editor view state shareable through URL search params, without changing the app's browser-local Mermaid source/settings persistence model.

## Background

- Source research: `docs/react-router-research.md`.
- The app is a static Vite + React + TypeScript Mermaid editor with no backend, server API, accounts, or remote synchronization.
- `src/main.tsx` currently renders `<App />` directly.
- `src/App.tsx` owns cross-panel state for source, settings, export controls, template filters, modal visibility, and preview layout.
- `source`, `settings`, and `locale` are persisted through browser localStorage and must remain local browser state.
- `selectedType`, `search`, `scale`, `zoom`, and `filename` are currently memory-only state and are suitable URL-state candidates.
- `src/components/PreviewPane.tsx` renders preview/export/error tabs, but the selected tab is currently uncontrolled and not URL-restorable.

## Requirements

1. Add React Router in the smallest suitable Library Mode shape for this app.
   - Use the current official package/import style for React Router.
   - Keep the app as a single `/` editor workbench route.
   - Do not introduce React Router framework mode, loaders, actions, server rendering, or route-level data fetching.
2. Add URL search-param state for lightweight view state.
   - Support `type` for selected template type.
   - Support `q` for template search text.
   - Support `tab` for preview tab, with allowed values `preview`, `export`, and `error`.
   - Support `zoom` for preview zoom, bounded to the existing `50..200` range.
   - Support `scale` for export scale, bounded to the existing `1..4` values.
   - Support `filename` for the export filename basename.
3. Keep non-URL state boundaries intact.
   - Do not put Mermaid source in the URL.
   - Do not put full diagram settings JSON in the URL.
   - Do not put SVG/PNG/JPG/Markdown export payloads in the URL.
   - Do not route modal open state unless a later task turns modals into pages.
   - Keep locale localStorage-only for this task.
4. Normalize every URL-derived value before it reaches UI controls.
   - Unknown template types fall back to the first chart type.
   - Unknown tabs fall back to `preview`.
   - Non-numeric or out-of-range `zoom` and `scale` values fall back or clamp to safe values.
   - `filename` remains a basename; existing export utilities still own final sanitization and extension handling.
5. Keep user interaction ergonomic.
   - Updating high-frequency controls such as zoom should not flood browser history.
   - Back/forward navigation should restore supported URL view state.
   - Existing editor, render, settings, copy, and export behavior should remain unchanged.
6. Add focused tests for the URL state behavior.
   - Cover invalid query parameter fallback.
   - Cover URL-driven initial state.
   - Cover interaction-driven query updates for representative controls.

## Acceptance Criteria

- [ ] The app installs and uses React Router without introducing `react-router-dom` unless the official package guidance requires it.
- [ ] Visiting `/?type=<known-type>&q=abc&tab=export&zoom=150&scale=3&filename=demo` initializes the workbench controls from the URL.
- [ ] Invalid query values do not crash and are normalized to safe UI values.
- [ ] Changing template type/search, preview tab, zoom, scale, or filename updates the URL search params.
- [ ] Browser back/forward restores the supported view state.
- [ ] Mermaid source, full diagram settings, locale, modal open state, and export payloads are not encoded into the URL.
- [ ] Existing localStorage persistence for source, settings, and locale still works.
- [ ] `npm test -- --run` passes.
- [ ] `npm run lint` passes.
- [ ] `npm run build` passes.

## Out Of Scope

- Multi-page routing for `/templates`, `/import`, or `/examples/:id`.
- Route-level lazy loading.
- Sharing Mermaid source through URL, compression, remote storage, or accounts.
- Backend services, APIs, databases, authentication, or server-side export.
- README screenshot updates unless implementation changes visible layout enough to require them.

## References

- `docs/react-router-research.md`
- `.trellis/spec/frontend/index.md`
- `.trellis/spec/frontend/component-guidelines.md`
- `.trellis/spec/frontend/hook-guidelines.md`
- `.trellis/spec/frontend/state-management.md`
- `.trellis/spec/frontend/quality-guidelines.md`
- `.trellis/spec/frontend/type-safety.md`
