# Design

## Boundaries

Primary files:

- `src/App.tsx`
- New focused modules under `src/components/` or `src/hooks/`
- `src/components/MarkdownImportModal.tsx`
- `src/i18n/messages.ts`
- `src/i18n/types.ts` if message contracts need a new field
- Existing tests that cover app/i18n behavior

## Extraction Order

1. `useExportActions`
   Owns SVG/raster/Markdown/copy commands and feedback messages. Inputs remain `svg`, `source`, `filename`, `scale`, `settings.background`, and `canExport`.

2. `TemplateSidebar`
   Owns sidebar rendering and filter UI. Parent still owns selected type/search/source updates unless moving local sidebar state is proven safe.

3. `HeaderActions`
   Owns language select, copy button, export dropdown, reset-template button, and status display props. Parent still computes render status and passes callbacks.

4. Markdown placeholder i18n
   Add `messages.markdownImport.placeholder` and use it from `MarkdownImportModal`.

## State Ownership

Do not move these into hidden child-local state if another panel depends on them:

- `source`
- `settings`
- `scale`
- `zoom`
- `filename`
- `selectedType` if template sidebar and active-template notice both depend on it
- render state and SVG

## Compatibility

The DOM may change slightly because of component boundaries, but user-visible labels, controls, and enabled/disabled behavior should remain equivalent.

## Testing

Prefer existing behavior tests. Add i18n coverage if message shape changes are not already covered by `src/App.i18n.test.tsx`.
