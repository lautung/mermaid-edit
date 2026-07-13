# Component Guidelines

> How components are built in this project.

## Overview

Frontend components are React function components with local TypeScript prop types. Components should preserve the existing data-flow contract of their parent and keep imperative browser libraries behind a focused wrapper.

## Component Structure

Use this order: imports, local prop/type declarations, stable configuration constants, component function, and small local helpers. Put an imperative editor or DOM integration in its own component instead of mixing it into a layout component.

## Props Conventions

Prefer explicit props such as `value: string` and `onChange: (value: string) => void` for controlled inputs. A component that wraps an imperative editor must call `onChange` only for user document changes and must synchronize external values without creating a feedback loop.

## Styling Patterns

This project uses shared styles in `src/styles.css`. Component-specific DOM classes should be stable and scoped under the component root, such as `.codeEditor .cm-editor`, so the surrounding layout remains compatible.

## Accessibility

Interactive regions require an accessible label. Code editors should expose a meaningful `aria-label` on the editor root and retain keyboard editing support.

## Feature Components

Settings and import flows should be isolated in focused components with explicit controlled props. Browser-only behaviors such as local storage, Markdown parsing, Mermaid configuration detection, and blob downloads should remain behind small hooks or utility modules so the main layout only coordinates state and user actions.

Mermaid templates are data, not component branches. Add a stable template id and type, keep user-facing labels in the template metadata, and use the bundled Mermaid parser to verify new official syntax.

## Internationalization

User-facing component text should come from `useI18n()` rather than local string literals. Keep locale selection and Ant Design locale wiring at the app shell, and pass translated accessibility labels into imperative wrappers such as `MermaidCodeEditor` without changing their controlled `value` / `onChange` contract.

Template Mermaid source strings are stable examples and should not be rewritten for locale changes. Localize template titles, types, and tags through the i18n metadata layer keyed by the template id, then keep the original Mermaid source parseable by the bundled Mermaid parser.

## Syntax Diagnostics

`useMermaidRenderer` owns Mermaid parse failures and may expose a structured diagnostic only on its `status: "error"` result. Keep the raw Mermaid message in the diagnostic for a collapsible technical-details view; render friendly summaries in surrounding status UI so parser output is not duplicated across the page.

An editor-facing diagnostic must use the `MermaidCodeEditorHandle` commands instead of reaching into CodeMirror DOM from layout code:

```tsx
editorRef.current?.focusLine(diagnostic.line);
editorRef.current?.insertAfterLine(diagnostic.line, diagnostic.rule.snippet);
```

Commands may focus or append text, but must not replace selected or existing source. This preserves the controlled `value` / `onChange` contract and keeps local persistence in `App` as the single source of truth.

## Common Mistakes

Avoid recreating an imperative editor whenever a controlled `value` changes. Create it once, dispatch external document replacements only when the document differs, and destroy it during cleanup.
