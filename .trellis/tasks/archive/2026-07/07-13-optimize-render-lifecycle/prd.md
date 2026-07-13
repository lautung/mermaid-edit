# Optimize Mermaid render lifecycle

## Goal

Avoid unnecessary Mermaid initialization and rendering when only locale/UI text changes, while preserving localized status and diagnostic messages.

## Evidence

- `src/hooks/useMermaidRenderer.ts` effect currently depends on `[localeMessages, source, settings]`.
- The same effect calls `mermaid.initialize()`, schedules rendering, and derives localized errors.
- `App.tsx` passes locale-derived render and diagnostic messages, so changing app language can rerun Mermaid parse/render even when source and render settings are unchanged.

## Requirements

- Mermaid initialization should run when render settings change, not when only locale messages change.
- Render scheduling should depend on source and render-relevant settings.
- Locale changes should update visible idle/rendering/ready/error messages without re-rendering a valid unchanged SVG.
- Existing stale-request protection must remain intact.
- Existing chunk-load retry behavior must remain intact.
- Existing structured syntax diagnostics must still be localized after locale changes.

## Acceptance Criteria

- [ ] Locale-only changes do not call `mermaid.render()` for unchanged source/settings.
- [ ] Settings changes still reinitialize Mermaid and rerender the diagram.
- [ ] Source changes still debounce rendering and invalidate stale requests.
- [ ] Existing render hook tests pass, with new coverage for locale-only updates.
- [ ] Error diagnostics update language appropriately without accepting stale async results.

## Out of Scope

- Replacing Mermaid rendering.
- Changing visible layout or editor controls.
- Adding server-side rendering or web worker rendering.
