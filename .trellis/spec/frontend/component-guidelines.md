# Component Guidelines

How components are built in this project.

## Overview

Frontend components are React function components with local TypeScript prop types. Components should preserve the existing parent-owned data-flow contract and keep imperative browser libraries behind focused wrappers.

## Component Structure

Use this order:

1. imports
2. local prop/type declarations
3. stable configuration constants
4. component function
5. small local helpers

Put imperative editor or DOM integration in its own component instead of mixing it into a layout component.

## Props Conventions

Prefer explicit controlled props such as `value: string` and `onChange: (value: string) => void`.

Components wrapping imperative libraries must:

- create the library instance once
- synchronize external values without creating feedback loops
- call `onChange` only for user document changes
- clean up browser resources during unmount

`MermaidCodeEditor` is the reference implementation for this pattern.

## Layout and Ant Design

`App.tsx` owns the shell layout with Ant Design `Layout`, `Sider`, `Header`, `Content`, `Splitter`, menus, buttons, badges, tabs, and modals. Keep panel components focused:

- `EditorPane` coordinates the code editor and syntax assistant.
- `PreviewPane` renders the Mermaid SVG and preview controls.
- `SettingsPanel` edits render/export settings.
- `MarkdownImportModal` parses Markdown fenced code blocks.
- `TemplateManagerModal` exposes bundled template metadata.
- `StatusBar` summarizes render state and source metrics.

Do not turn layout state into hidden component-local state when it affects another panel.

## Styling Patterns

This project uses shared styles in `src/styles.css`. Component-specific DOM classes should be stable and scoped under the component root, such as `.codeEditor .cm-editor`, so surrounding layout remains compatible.

Avoid targeting Ant Design generated internals when a local wrapper class can express the intended layout.

## Accessibility

Interactive regions require accessible labels. Code editors should expose a meaningful `aria-label` on the editor root and retain keyboard editing support.

Icon-only buttons require an accessible name through Ant Design tooltip/title/aria patterns.

## Templates and Diagnostics

Mermaid templates are data, not component branches. Add a stable template id and type, keep user-facing labels in template metadata, and verify new official syntax with Mermaid tests.

`useMermaidRenderer` owns Mermaid parse failures and may expose a structured diagnostic only on its `status: "error"` result. Keep the raw Mermaid message in the diagnostic for technical details; render friendly summaries in surrounding status UI.

Editor-facing diagnostic actions must use `MermaidCodeEditorHandle` commands:

```tsx
editorRef.current?.focusLine(diagnostic.line);
editorRef.current?.insertAfterLine(diagnostic.line, diagnostic.rule.snippet);
```

Commands may focus or insert text, but must not silently replace existing source. This preserves the controlled `value` / `onChange` contract and keeps local persistence in `App` as the single source of truth.

## Common Mistakes

- Do not recreate CodeMirror whenever a controlled `value` changes.
- Do not duplicate Mermaid parse or render calls in UI components.
- Do not add a new branch in `App.tsx` for every template type; extend `diagramTemplates` instead.
- Do not bypass `copySvg`, `downloadSvg`, `downloadRaster`, or `downloadMarkdown` for export UI.
