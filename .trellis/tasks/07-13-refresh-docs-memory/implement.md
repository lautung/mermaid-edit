# Implementation Plan

1. Inventory current source, docs, scripts, and Trellis spec files.
2. Rewrite `README.md` around current capabilities and add screenshot references.
3. Add project-specific `AGENTS.md` guidance outside the Trellis managed block.
4. Refresh `.trellis/spec/frontend/` files with current app conventions.
5. Neutralize or remove stale `.trellis/spec/backend/` guidance.
6. Run tests and build checks:
   - `npm test -- --run`
   - `npm run lint`
   - `npm run build`
7. Run the app locally and capture desktop/mobile screenshots into `docs/screenshots/`.
8. Verify README screenshot links and responsive layout in browser.
9. Write the memory update note.
10. Review diff for unrelated churn, stale template text, broken Markdown links, and secrets/runtime artifacts.

## Risk Points

- `AGENTS.md` Trellis block is managed; edits must stay outside the block.
- Screenshot files can become noisy; keep the set small and generated from the current UI.
- Backend spec cleanup must not break Trellis scripts that expect layer directories; prefer a clear `not-applicable` guide if deletion causes tool issues.
