# Add App Internationalization

## Goal

Add first-class internationalization to the Mermaid editor so users can operate the app in Simplified Chinese, Traditional Chinese for Hong Kong, English, Japanese, Korean, and Russian.

## Background

The app is a frontend-only Vite + React + Ant Design editor. User-facing text is currently hard-coded across `src/App.tsx`, workspace components, template metadata, render state messages, Markdown import UI, and syntax diagnostic helpers.

## Requirements

- Support exactly these locales in the initial language selector:
  - Simplified Chinese: `zh-CN`
  - Traditional Chinese, Hong Kong focused: `zh-HK`
  - English: `en`
  - Japanese: `ja`
  - Korean: `ko`
  - Russian: `ru`
- Provide a visible language selector in the main editor chrome.
- Persist the selected locale locally in the browser.
- Localize primary app UI text, status messages, export feedback, settings labels, Markdown import UI, template title/type/tag metadata, and syntax assistant friendly messages.
- Use Ant Design locale packs so built-in component text follows the selected locale when available.
- Keep Mermaid source examples stable unless changing them is necessary for UI localization.
- Preserve the existing render, export, Markdown import, settings, template selection, and syntax repair flows.

## Acceptance Criteria

- [x] Users can switch among `zh-CN`, `zh-HK`, `en`, `ja`, `ko`, and `ru` from the editor UI.
- [x] The selected locale survives a page reload via local storage.
- [x] Main controls, panels, status text, settings, Markdown import text, template metadata, and friendly syntax diagnostic text update when the locale changes.
- [x] Ant Design built-in locale is wired through `ConfigProvider`.
- [x] Existing tests pass, and new or updated tests cover locale switching and at least one localized diagnostic/template path.
- [x] `npm test -- --run`, `npm run lint`, and `npm run build` pass.
