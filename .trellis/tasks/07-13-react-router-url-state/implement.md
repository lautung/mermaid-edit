# Implementation Plan

## Checklist

1. Dependency and router shell
   - Install the current `react-router` package.
   - Wrap `<App />` with `BrowserRouter` in `src/main.tsx`.
2. Shared URL-state types and hook
   - Add `PreviewTab` and URL-state constants where they best fit the existing type layout.
   - Add `src/hooks/useEditorSearchParams.ts`.
   - Add `src/hooks/useEditorSearchParams.test.tsx`.
3. Preview tab control
   - Update `PreviewPane` props for controlled `activeTab`.
   - Wire `Tabs` with `activeKey` and `onChange`.
   - Update `PreviewPane` tests.
4. App wiring
   - Replace `useState` for selected type/search/scale/zoom/filename with `useEditorSearchParams(chartTypes)`.
   - Keep source/settings/locale/localStorage state unchanged.
   - Ensure template selection updates both source and URL-backed `type`.
5. Verification
   - Run `npm test -- --run`.
   - Run `npm run lint`.
   - Run `npm run build`.
   - If tests reveal app-level router wrapper needs adjustment, update focused tests rather than broad rewrites.

## Risk Areas

- React Router version/import compatibility with React 18 and Vite.
- Ant Design Tabs `onChange` passes `string`, so the implementation must narrow to allowed preview tabs.
- Search params are strings; parsing must not widen app state types to `string`.
- Continuous zoom slider updates can add too many history entries; use replace for high-frequency updates.
- App tests that render `App` without a router may fail after `useSearchParams` is introduced.

## Validation Commands

```bash
npm test -- --run
npm run lint
npm run build
```
