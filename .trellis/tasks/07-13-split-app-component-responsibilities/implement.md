# Implementation Plan

## Checklist

- [x] Add Markdown import placeholder to i18n message types and locale data.
- [x] Update `MarkdownImportModal` to use the localized placeholder.
- [x] Extract export actions into a focused hook/helper and update `App.tsx`.
- [x] Extract template sidebar.
- [x] Extract header actions.
- [x] Run app/component/i18n targeted tests and full validation.

## Validation

```bash
npm test -- --run src/App.i18n.test.tsx
npm test -- --run src/components
npm test -- --run
npm run lint
npm run build
```

Because this task touches visible UI composition, run browser smoke checks for desktop and `390x844` mobile layouts before archiving.

## Risk Points

- Moving callbacks can accidentally close over stale `svg`, `source`, or settings values.
- Moving sidebar state can break active-template notice behavior.
- i18n message contract changes must update all locale entries.
