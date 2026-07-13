# Split App component responsibilities

## Goal

Reduce `App.tsx` responsibility concentration by extracting focused UI/action units without changing current editor workflows or adding hidden state.

## Evidence

- `MermaidEditorApp()` currently owns template filtering, template selection, header actions, export menu, export notifications, Markdown import, template manager state, settings state, source state, zoom, filename, scale, and desktop/mobile workspace layout.
- The optimization research recommends gradual extraction rather than a one-shot rewrite.
- `src/components/MarkdownImportModal.tsx` still has a hardcoded Mermaid placeholder string; user-facing component text should live in `src/i18n/messages.ts`.

## Requirements

- Extract responsibilities only where the boundary is clear and lowers future change risk.
- Keep cross-panel state owned by `MermaidEditorApp` unless a hook has a narrow action responsibility.
- Do not change visible workflows for editing, previewing, template selection, language switching, copy/export, Markdown import, or settings.
- Move hardcoded Markdown import placeholder text into i18n messages.
- Add or update tests only where behavior can regress from extraction.

## Acceptance Criteria

- [x] Export action logic is isolated from `App.tsx` in a focused hook or helper.
- [x] Template sidebar rendering/filtering is isolated in a focused component or helper without owning source state.
- [x] Header actions are isolated enough that `App.tsx` no longer contains the full export menu definition inline.
- [x] Markdown import placeholder comes from `src/i18n/messages.ts`.
- [x] Existing app/i18n/component tests pass.

## Out of Scope

- Full app rewrite.
- Adding global state.
- Changing Ant Design layout structure or visual design.
- Changing template data shape beyond what extraction requires.
