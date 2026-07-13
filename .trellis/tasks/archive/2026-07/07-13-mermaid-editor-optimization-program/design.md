# Design

## Structure

This parent task owns coordination only. Implementation should happen in child tasks.

The child task order is:

1. Bundle and lazy dependency loading.
2. Mermaid render lifecycle.
3. Export edge cases.
4. Local storage and settings migration.
5. App component responsibility split.

The first two are P0 because they address runtime cost and repeated work. The remaining tasks are P1 because they improve resilience and maintainability after the performance-critical paths are stable.

## Boundaries

- Parent task files may describe task sequencing, shared constraints, and integration validation.
- Parent task should not directly edit `src/` unless a later review finds a cross-child integration-only change.
- Child tasks own code changes, tests, and archive commits.

## Shared Constraints

- Keep all behavior browser-local.
- Reuse existing modules and tests before adding abstractions.
- Preserve current user-visible workflows for editing, previewing, diagnostics, templates, and exports.
- Treat `docs/optimization-research.md` as evidence, but verify every item against current source before changing code.

## Final Integration Review

After all children complete, run the full validation set and check whether:

- build chunk output improved or has a documented reason when a warning remains;
- locale switching does not trigger avoidable render work;
- export tests cover the shared SVG dimension parser and failure paths;
- localStorage failures or corrupt settings fall back safely;
- `App.tsx` delegates focused behavior without hiding shared state in children.
