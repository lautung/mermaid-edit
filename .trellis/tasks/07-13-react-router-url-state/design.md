# Design

## Architecture

The change adds a minimal React Router shell and a focused URL-state hook. The product remains a single browser-local editor workbench.

```text
src/main.tsx
  BrowserRouter
    App
      I18nProvider
        MermaidEditorApp
          useEditorSearchParams(chartTypes)
          TemplateSidebar
          PreviewPane
          SettingsPanel
```

React Router is used only to provide routing context and search-param APIs. The app does not gain server data loading, route actions, framework mode, or additional pages.

## URL Contract

Supported query params:

| Param | Owner state | Allowed shape | Fallback |
|-------|-------------|---------------|----------|
| `type` | selected template type | one of `chartTypes` | `chartTypes[0]` |
| `q` | template search text | string | `""` |
| `tab` | preview tab | `preview` / `export` / `error` | `preview` |
| `zoom` | preview zoom | integer clamped to `50..200` | `100` |
| `scale` | export scale | integer in `1..4` | `2` |
| `filename` | export basename | string | `mermaid-diagram` |

Excluded from URL:

- Mermaid source
- diagram settings JSON
- locale
- modal open state
- rendered SVG or exported files

## Hook Boundary

Add `src/hooks/useEditorSearchParams.ts`.

The hook will:

- call React Router's `useSearchParams`;
- normalize supported params into typed values;
- expose setter functions for each supported value;
- update only the changed param while preserving other supported and unknown params;
- use `replace` for high-frequency updates such as zoom and text-like control updates where history noise is undesirable;
- keep push navigation available for lower-frequency selection changes when useful.

The hook owns parsing and bounds checks so components do not cast raw URL values.

## Component Changes

`src/main.tsx` wraps the app in `BrowserRouter`.

`src/App.tsx` replaces memory-only state for selected template type, search, scale, zoom, and filename with hook-returned URL state. It continues to own source/settings/localStorage, render state, export actions, and modal open state.

`src/components/PreviewPane.tsx` becomes controlled for tab selection:

- add `activeTab: PreviewTab`
- add `onActiveTabChange: (tab: PreviewTab) => void`
- pass `activeKey` and `onChange` into Ant Design `Tabs`

## Compatibility

Existing URLs without query params keep current default behavior.

Malformed query params are normalized before reaching controls. Unknown query params are preserved when updating supported params, so external campaign/debug params are not stripped.

LocalStorage remains the source of persistence for source/settings/locale. URL params override only the supported lightweight view state.

## Testing Strategy

Add unit tests around the hook using a memory router or browser router test wrapper:

- URL initializes normalized state.
- invalid values fall back or clamp.
- setters update search params.

Update component tests for `PreviewPane` to cover controlled active tab behavior.

If existing app/i18n tests mount `App`, update their wrappers or rely on `main.tsx` router only where appropriate.

## Rollback

Reverting this task should remove:

- the `react-router` dependency;
- router wrapper in `src/main.tsx`;
- `useEditorSearchParams` and tests;
- `PreviewPane` active tab props;
- App wiring from URL state.

The localStorage-backed source/settings/locale model is not migrated, so rollback does not require data migration.
