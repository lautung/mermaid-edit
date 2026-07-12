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

## Common Mistakes

Avoid recreating an imperative editor whenever a controlled `value` changes. Create it once, dispatch external document replacements only when the document differs, and destroy it during cleanup.
