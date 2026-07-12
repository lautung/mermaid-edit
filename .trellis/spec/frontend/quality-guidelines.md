# Quality Guidelines

> Code quality standards for frontend development.

## Overview

Frontend quality is checked with ESLint, TypeScript/Vite production build, Vitest behavior tests, and a browser smoke check for user-facing editor changes.

## Forbidden Patterns

Do not bypass the controlled `value` / `onChange` boundary, recreate CodeMirror on each render, or emit `onChange` for programmatic external-value synchronization. These patterns cause lost cursor state, feedback loops, or unnecessary rendering.

## Required Patterns

New stateful UI behavior should have a focused Vitest test. For CodeMirror wrappers, assert the initial document, a real document change callback, and synchronization from an externally changed value.

## Testing Requirements

Run `npm test -- --run`, `npm run lint`, and `npm run build`. For editor changes, verify in a browser that valid Mermaid input renders, invalid input shows the existing error state, and the 390px layout has no horizontal overflow.

## Code Review Checklist

Reviewers should check the parent-child prop contract, editor lifecycle cleanup, external synchronization annotations, accessibility labeling, and preservation of the existing Mermaid render/export flow.
