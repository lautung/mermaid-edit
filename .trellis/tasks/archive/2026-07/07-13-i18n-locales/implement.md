# Implementation Plan

## Checklist

- [x] Add typed locale dictionaries and Ant Design locale mapping under `src/i18n/`.
- [x] Wrap the app with the i18n provider and selected Ant Design locale.
- [x] Replace hard-coded UI strings in `App`, workspace panes, settings, status bar, Markdown import, syntax assistant, and CodeMirror accessibility labels.
- [x] Localize template metadata while keeping Mermaid source examples stable.
- [x] Localize render state and friendly syntax diagnostics.
- [x] Add focused tests for locale switching and localized diagnostic/template metadata.
- [x] Run `npm test -- --run`, `npm run lint`, and `npm run build`.

## Validation Commands

```bash
npm test -- --run
npm run lint
npm run build
```

## Risk Points

- `useMermaidRenderer` async state must keep its stale-render protection.
- CodeMirror must not be recreated due to translation changes except when the accessible label changes through React props.
- Template source strings should remain valid Mermaid syntax.
- Existing tests with Chinese text queries may need to query localized defaults or semantic labels.
