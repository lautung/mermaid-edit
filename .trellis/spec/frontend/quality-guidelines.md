# Quality Guidelines

> Code quality standards for frontend development.

## Overview

Frontend quality is checked with ESLint, TypeScript/Vite production build, Vitest behavior tests, and a browser smoke check for user-facing editor changes.

## Forbidden Patterns

Do not bypass the controlled `value` / `onChange` boundary, recreate CodeMirror on each render, or emit `onChange` for programmatic external-value synchronization. These patterns cause lost cursor state, feedback loops, or unnecessary rendering.

## Required Patterns

New stateful UI behavior should have a focused Vitest test. For CodeMirror wrappers, assert the initial document, a real document change callback, and synchronization from an externally changed value.

### Async Mermaid Rendering Contract

`useMermaidRenderer` treats every `source` or settings change as a new render request, including an empty source. A request captures its current id, and its asynchronous success or error result may update React state only when that id is still current. Empty source commits `idle` with an empty SVG and invalidates all in-flight requests.

The hook may keep the previous SVG while the current request is `rendering`, but a stale request must never restore an SVG, `ready`, or `error` state. Tests should exercise the public `{ svg, state }` result with an older success, an older error, and an empty latest source.

### Preview Scaling Contract

Preview zoom must participate in layout sizing. Do not use `transform: scale(...)` for the rendered Mermaid surface: transforms do not change the scrollable layout area, so enlarged diagrams can be clipped. Apply the percentage with the CSS `zoom` property instead; the SVG's existing `max-width: 100%` and `height: auto` preserve its aspect ratio, while the preview canvas can scroll when enlarged. Add a focused component test for the `zoom` style and browser-check 50%, 100%, and 200% zoom.

## Testing Requirements

Run `npm test -- --run`, `npm run lint`, and `npm run build`. For editor changes, verify in Chrome that valid Mermaid input renders, invalid input shows the existing error state, templates load, settings affect rendering, Markdown import handles multiple fenced blocks, and the 390px layout has no horizontal overflow. Blob downloads should be verified through the user-visible action path; automation may not expose a client-side download event.

## Code Review Checklist

Reviewers should check the parent-child prop contract, editor lifecycle cleanup, external synchronization annotations, accessibility labeling, Frontmatter precedence, local-only persistence, official Mermaid template syntax, preservation of the existing Mermaid render/export flow, and the async Mermaid rendering contract above.
