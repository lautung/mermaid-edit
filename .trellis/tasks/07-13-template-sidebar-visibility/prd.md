# Fix template sidebar visibility

## Goal

Keep the template list visible and usable when the sidebar contains many Mermaid chart types.

The current UI puts every chart type in a vertical Ant Design menu before the template list. After the template set grew, the type menu consumes too much sidebar height and pushes "模板列表" toward the bottom, so users cannot quickly see or pick templates.

## Confirmed Facts

- The sidebar is rendered in `src/App.tsx` inside `Sider.templateSider`.
- Chart types are derived from `diagramTemplates` through `chartTypes`, then rendered as a vertical `Menu` under "图表类型".
- The template list is rendered below the type menu as `List.templateList`.
- Sidebar sizing is controlled in `src/styles.css`; `.templateList` currently uses `max-height: calc(100vh - 395px)`, which depends on an assumed type-menu height.
- This is a focused frontend layout fix. It should preserve the existing template selection data flow: choosing a template updates `source` and `selectedType`.

## Requirements

- R1: The template list must remain visible without requiring the user to scroll past the full chart-type list first.
- R2: Users must still be able to filter templates by chart type and search by template title or tag.
- R3: The fix must work with the current number of chart types and tolerate future additions without pushing the template list out of view again.
- R4: The solution must preserve the existing Ant Design-based visual language and not introduce a new dependency.
- R5: The mobile/collapsed sidebar behavior must not regress.

## Selected Approach

Use a compact, wrapping chart-type button group with its own bounded scroll area. The template list remains below it and owns the remaining sidebar height, so users can still click chart types directly while templates stay visible.

## Acceptance Criteria

- [ ] On desktop, "模板列表" and at least the top of the filtered template list are visible in the left sidebar at normal viewport heights.
- [ ] The chart-type control remains usable for all current types.
- [ ] Searching templates still filters within the selected type.
- [ ] Selecting a template still loads its source and updates the selected chart type.
- [ ] `npm test -- --run`, `npm run lint`, and `npm run build` pass.
- [ ] A browser check confirms the sidebar layout no longer hides the template list.

## Out of Scope

- Adding or removing Mermaid templates.
- Changing Mermaid rendering, export, or syntax diagnostic behavior.
- Building a full template-management workflow behind the existing "管理模板" button.

## Notes

- Lightweight task: PRD-only is sufficient after the user approves the selected layout approach.
