# 修复预览图片缩放

## Goal

让不同长宽比例和复杂度的 Mermaid 图在预览区域中保持正确比例、可读，并让缩放后的图表可以通过滚动完整查看。

## Confirmed Facts

- `src/components/PreviewPane.tsx` 使用 `transform: scale(...)` 实现预览缩放。
- CSS transform 不参与布局尺寸计算；预览画布的滚动区域仍按未缩放尺寸计算，放大后的图表可能被裁切。
- `src/styles.css` 为预览 SVG 设置了 `max-width: 100%` 与 `height: auto`，应继续保留其等比缩小能力。
- 本次改动仅涉及浏览器端预览，不改变 Mermaid 渲染结果或 SVG/PNG/JPG 导出内容。

## Requirements

- R1：预览缩放必须参与布局尺寸计算，使预览画布可为放大后的图表提供正确滚动范围。
- R2：图表在默认和缩放状态下均不得改变原始宽高比。
- R3：窄、宽、长图均应能在预览面板中查看完整内容；当超出面板时允许滚动查看，不以压缩或裁切替代。
- R4：保留现有预览控件、渲染状态、错误提示和导出行为。

## Acceptance Criteria

- [x] 缩放预览时，渲染图的有效布局尺寸随缩放倍数改变，放大内容不被无滚动地裁切。
- [x] SVG 预览继续以等比方式显示，没有非等比拉伸。
- [x] 为预览缩放行为增加聚焦测试，并保留现有测试通过。
- [x] 在 Chrome 中验证典型 Mermaid 图表能以 50%、100% 和 200% 缩放显示，且预览可滚动查看超出区域。
- [x] `npm test -- --run`、`npm run lint` 与 `npm run build` 均通过。

## Out of Scope

- 修改 Mermaid 语法、渲染配置或导出文件分辨率。
- 新增适配页面的独立缩略图、自动缩放策略或持久化新的缩放偏好。

## Notes

- Keep `prd.md` focused on requirements, constraints, and acceptance criteria.
- Lightweight tasks can remain PRD-only.
- For complex tasks, add `design.md` for technical design and `implement.md` for execution planning before `task.py start`.
