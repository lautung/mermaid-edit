# Type Safety

Type safety patterns in this project.

## Overview

The project uses TypeScript with shared discriminated unions and narrow literal types for editor settings, export formats, and Mermaid render states.

## Type Organization

- Shared app contracts live in `src/types.ts`.
- Diagnostic contracts live in `src/diagnostics/types.ts`.
- Component-only prop types stay local to the component file unless multiple modules need them.
- Template data has an exported `DiagramTemplate` type beside `diagramTemplates`.

Prefer literal unions over broad strings for user-selectable settings:

```ts
export type MermaidLayout = "dagre" | "elk";
export type ExportFormat = "svg" | "png" | "jpg";
```

## Validation

This app currently does not use a validation library. Runtime boundaries are small and should stay explicit:

- Mermaid source is validated by `mermaid.parse`.
- Markdown import extracts fenced blocks with `extractMermaidBlocks`.
- localStorage JSON should fall back to defaults when invalid.
- Filename sanitization happens before downloads.

If a future feature accepts untrusted structured data beyond Markdown text or local settings, add focused runtime validation at that boundary.

## Common Patterns

- Use discriminated unions for status-specific fields, as in `RenderState`.
- Use `Extract<ExportFormat, "png" | "jpg">` for raster-only APIs.
- Use generic setters for settings updates so key/value types stay linked.
- Keep browser APIs wrapped behind narrow functions that throw user-facing `Error` messages.

## Forbidden Patterns

- Do not widen app settings to `string` unless the value can truly be arbitrary.
- Do not cast Mermaid or CodeMirror values through `any` to silence type errors.
- Do not add optional fields to every render state variant when a discriminated union can express the state-specific contract.
- Do not let tests pass only by asserting implementation details instead of public behavior.
