# Refresh project docs and memory

## Goal

Refresh stale project documentation, Trellis guidance, and memory notes so future work reflects the current Mermaid editor rather than the older static-export baseline or generic backend/frontend templates.

## Confirmed Facts

- The app is a browser-local Vite + React + TypeScript Mermaid editor.
- `package.json` exposes `dev`, `build`, `test`, `preview`, and `lint` scripts.
- The current UI uses Ant Design, CodeMirror, Mermaid, `@mermaid-js/layout-elk`, `canvg`, and localStorage-backed settings.
- `README.md` already mentions current features such as template management, Markdown import/export, settings, Frontmatter precedence, and local-only processing, but it has no screenshots.
- `AGENTS.md` currently contains only the managed Trellis block and no project-specific guidance outside that block.
- `.trellis/spec/frontend/index.md` and several frontend guides still contain template or partially filled content.
- `.trellis/spec/backend/` is still present even though no backend source tree or server runtime is present in this repository.
- README should use two screenshots: one desktop view and one narrow/mobile view, stored under `docs/screenshots/`.

## Requirements

- Update `README.md` with current project facts, setup/build/test commands, browser-local data boundaries, export behavior, and screenshots.
- Add README screenshot assets under a docs-owned path and reference them with stable relative Markdown links.
- Update `AGENTS.md` outside the managed Trellis block with project-specific agent instructions, including UTF-8, Chinese communication preference, PowerShell 7 preference on Windows, and the static frontend-only nature of this repo.
- Refresh `.trellis/spec/frontend/` so the index and guide files describe the real source layout, component patterns, hooks, local state, test expectations, Mermaid rendering/export boundaries, and quality checks.
- Remove or neutralize stale `.trellis/spec/backend/` guidance so Trellis and future agents do not treat this repository as a backend project.
- Add a memory update note describing the current project state and the stale assumptions replaced by this task.
- Keep changes documentation-focused; do not implement product features unless needed only to generate or verify documentation screenshots.

## Acceptance Criteria

- [x] `README.md` includes at least one desktop screenshot and one narrow/mobile screenshot of the real running app.
- [x] README commands match `package.json` and have been validated or clearly reported if validation cannot run.
- [x] `AGENTS.md` has project-specific instructions outside the `TRELLIS` managed block and preserves the managed block unchanged.
- [x] Trellis frontend specs no longer contain "To fill" template status for active project guidance.
- [x] Backend Trellis spec guidance no longer advertises database, logging, ORM, or server conventions for this frontend-only project.
- [x] A memory update note exists under `C:\Users\admin\.codex\memories\extensions\ad_hoc\notes\`.
- [x] `npm test -- --run`, `npm run lint`, and `npm run build` pass, or any failure is documented with exact cause.
- [x] Browser verification captures the README screenshots from the current app and checks desktop and mobile layouts.

## Out of Scope

- New Mermaid editor product features.
- Deployment changes or Vercel reconfiguration.
- Direct edits to `C:\Users\admin\.codex\memories\MEMORY.md`.
