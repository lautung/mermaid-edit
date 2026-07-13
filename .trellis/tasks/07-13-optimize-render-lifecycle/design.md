# Design

## Boundaries

Primary files:

- `src/hooks/useMermaidRenderer.ts`
- `src/hooks/useMermaidRenderer.test.tsx`
- `src/App.tsx` only if the hook contract needs a small caller adjustment

## Hook Contract

Keep the public return shape:

```ts
{ svg: string; state: RenderState }
```

The hook should continue to own Mermaid initialization, parsing, rendering, retry handling, and diagnostic derivation.

## Effect Split

Use separate concerns:

1. Settings initialization effect.
2. Render request effect keyed by source and render settings.
3. Locale-message reconciliation for existing states.

The render request should capture enough locale context to build the immediate result, but locale reconciliation should be able to refresh displayed messages for existing idle/ready/error states without launching Mermaid work.

## Diagnostics

Structured diagnostics currently store localized summary/action text. To support locale changes without re-rendering, retain enough error context to rederive diagnostics when needed, or update only future diagnostics if the cost/risk of retaining error context is too high.

Recommended approach: store the last render error and source for error states inside hook refs, then rederive diagnostics on locale changes if the current state is still an error for that source.

## Async Safety

Continue using a monotonically increasing render id. Empty source must invalidate in-flight work. Locale-only changes must not create a new render id unless they intentionally invalidate no-longer-relevant work.
