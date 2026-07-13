# Design

## Boundaries

This task updates documentation and guidance only. Source changes are limited to files needed for documentation, generated screenshots, Trellis specs, and a memory update note.

## Documentation Shape

- `README.md` should be user-facing: concise overview, screenshot section, capability list, setup commands, validation commands, export/data-boundary notes, and deployment note.
- `AGENTS.md` should be agent-facing: project facts and workflow constraints outside the managed Trellis block, leaving the managed block untouched.
- `.trellis/spec/frontend/` should be maintainer-facing: concrete conventions tied to the current `src/` layout and test commands.
- `.trellis/spec/backend/` should stop acting as a live backend guide. If the directory remains, it should clearly say backend is not applicable for this repository.

## Screenshot Strategy

Use the real app in a browser at two viewports:

- desktop: enough width to show template library, editor, preview, and settings
- mobile/narrow: verify responsive stacking and no horizontal overflow

Store screenshots in `docs/screenshots/` so README links remain stable and screenshots are not mixed with production `public/` assets.

## Memory Update

Write one ad-hoc memory note under `C:\Users\admin\.codex\memories\extensions\ad_hoc\notes\` with the task outcome and replacement facts. Do not edit generated memory summary files directly.

## Compatibility

Preserve existing Trellis managed content in `AGENTS.md`. If generated screenshots are large, keep only the minimum README set to avoid repository bloat.
