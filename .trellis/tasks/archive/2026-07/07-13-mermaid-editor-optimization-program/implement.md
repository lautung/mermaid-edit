# Implementation Plan

## Checklist

- [x] Review and approve this task split.
- [x] Start `07-13-optimize-bundle-lazy-loading`.
- [x] Complete and archive bundle/lazy-loading work.
- [x] Start `07-13-optimize-render-lifecycle`.
- [x] Complete and archive render-lifecycle work.
- [x] Start P1 children in an order that matches the current code risk:
  export hardening, localStorage/settings hardening, then component split.
- [x] After all children complete, run full validation from the parent checkout.
- [x] Record any deferred optimization with reason and evidence.

## Validation

Final parent-level validation should include:

```bash
npm test -- --run
npm run lint
npm run build
```

If any child changes visible UI/export behavior, also run browser smoke checks for:

- desktop valid Mermaid render;
- `390x844` mobile layout with no horizontal overflow;
- SVG / PNG / JPG / Markdown export availability for valid diagrams;
- export disabled or blocked for invalid Mermaid;
- representative Mermaid diagrams including `stateDiagram-v2`, `kanban`, `architecture-beta`, and ELK layout.

## Rollback

Rollback should happen per child task. Do not revert completed child work from the parent task unless the final integration review finds a cross-child regression that cannot be fixed locally.
