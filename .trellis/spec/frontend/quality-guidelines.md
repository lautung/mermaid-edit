# Quality Guidelines

Code quality standards for frontend development.

## Overview

Frontend quality is checked with Vitest behavior tests, ESLint, TypeScript/Vite production build, and browser smoke checks for user-facing editor or documentation screenshot changes.

## Required Commands

Run these after relevant changes:

```bash
npm test -- --run
npm run lint
npm run build
```

For UI layout, export, README screenshot, or responsive behavior changes, also verify the real app in Chrome.

## Browser Smoke Checks

Cover these paths when the UI or README screenshots are involved:

- valid Mermaid input renders a diagram
- invalid Mermaid input shows the existing error/diagnostic state
- templates load from the template library
- settings affect rendering or preview appearance
- Markdown import handles multiple fenced Mermaid blocks
- SVG / PNG / JPG / Markdown export actions remain enabled only when valid
- narrow/mobile viewport has no horizontal overflow

Blob downloads should be verified through the visible user action path when possible; automation may not expose a browser download event reliably.

## Forbidden Patterns

- Do not bypass the controlled `value` / `onChange` boundary.
- Do not recreate CodeMirror on each render.
- Do not emit `onChange` for programmatic external-value synchronization.
- Do not use `Image -> Canvas` for raster export; use `canvg` to render SVG directly to Canvas.
- Do not introduce backend assumptions into docs, tests, or Trellis specs for this frontend-only app.

## Required Patterns

New stateful UI behavior should have a focused Vitest test. For CodeMirror wrappers, assert the initial document, a real document change callback, and synchronization from an externally changed value.

### Async Mermaid Rendering Contract

`useMermaidRenderer` treats every `source` or settings change as a new render request, including an empty source. A request captures its current id, and its asynchronous success or error result may update React state only when that id is still current. Empty source commits `idle` with an empty SVG and invalidates all in-flight requests.

The hook may keep the previous SVG while the current request is `rendering`, but a stale request must never restore an SVG, `ready`, or `error` state. Tests should exercise the public `{ svg, state }` result with an older success, an older error, and an empty latest source.

### Preview Scaling Contract

Preview zoom must participate in layout sizing. Do not use `transform: scale(...)` for the rendered Mermaid surface: transforms do not change the scrollable layout area, so enlarged diagrams can be clipped. Apply the percentage with the CSS `zoom` property instead; the SVG's existing `max-width: 100%` and `height: auto` preserve its aspect ratio, while the preview canvas can scroll when enlarged.

## Code Review Checklist

Reviewers should check parent-child prop contracts, editor lifecycle cleanup, external synchronization annotations, accessibility labeling, Frontmatter precedence, local-only persistence, official Mermaid template syntax, preservation of the existing Mermaid render/export flow, and the async Mermaid rendering contract above.
