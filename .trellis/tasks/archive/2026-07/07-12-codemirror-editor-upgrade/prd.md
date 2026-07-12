# Upgrade Mermaid code editor with CodeMirror 6

## Goal

将 Mermaid 源码输入区从原生 textarea 升级为适合代码编辑的 CodeMirror 6，同时保持现有页面结构、Mermaid 渲染逻辑、主题切换和 SVG/PNG/JPG 导出行为不变。

## Background

- 当前 `src/components/EditorPane.tsx` 使用原生 `<textarea>` 编辑 Mermaid 源码。
- 当前 `src/hooks/useMermaidRenderer.ts` 已负责 Mermaid 解析、渲染、延迟更新和错误状态，不应因编辑器替换而改变。
- 当前 Ant Design 组件用于 Tabs、Alert 和文本状态展示，本次保留，不进行整站 UI 组件库迁移。
- 项目使用 React + TypeScript + Vite，构建命令为 `npm run build`，质量检查命令为 `npm run lint`。

## Requirements

1. 使用 CodeMirror 6 提供 Mermaid 源码编辑体验。
2. 编辑器受控于现有 `value` / `onChange` 接口，输入内容继续传给现有 Mermaid 渲染流程。
3. 支持基础代码编辑能力：光标、选择、撤销/重做、键盘输入、Tab 缩进和多行编辑。
4. 保留现有编辑器面板布局、Markdown 导入占位 Tab、状态提示和行数/字符数统计。
5. 编辑器应适配当前桌面和移动端布局，不引入横向溢出。
6. 不改变 Mermaid 主题、语法错误处理、实时预览和导出功能。
7. 新增依赖和配置使用 UTF-8，保持 TypeScript 类型检查通过。

## Acceptance Criteria

- [x] 代码输入区由 CodeMirror 6 渲染，不再依赖原生 textarea。
- [x] 修改 Mermaid 源码后，现有预览仍能按原流程更新。
- [x] 编辑器基础键盘编辑行为可用，且 `onChange` 能同步最新源码。
- [x] 现有语法错误提示、成功状态、行数和字符数统计继续正确显示。
- [x] 桌面端和移动端构建后无布局溢出或 TypeScript 错误。
- [x] `npm run lint` 和 `npm run build` 均通过。
- [x] Mermaid SVG、PNG、JPG 导出路径未被破坏。

## Out of Scope

- 不迁移 Ant Design 到 shadcn/ui、Mantine 或其他整体 UI 组件库。
- 不实现完整 Mermaid 专用语法解析器、智能补全或图形化拖拽编辑。
- 不修改 Mermaid 渲染 hook、导出工具和数据模型，除非 CodeMirror 接入暴露出必要的兼容性问题。
