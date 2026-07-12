# CodeMirror 6 编辑器升级设计

## 边界

只替换 `src/components/EditorPane.tsx` 中的源码输入控件。Ant Design 继续负责 Tabs、Alert 和状态文本；`src/hooks/useMermaidRenderer.ts`、`src/utils/exportDiagram.ts` 和上层 `value` / `onChange` 合约保持不变。

## 组件设计

新增一个受控的 `MermaidCodeEditor` 组件，接收 `value` 和 `onChange`。组件挂载时创建 CodeMirror `EditorView`，用初始 `value` 创建 `EditorState`；当外部 `value` 变化且不是编辑器自身产生的更新时，通过事务同步文档。文档变化通过 `EditorView.updateListener` 回调给父组件。

编辑器启用 CodeMirror 基础编辑能力、行号、当前行高亮、括号匹配、历史记录和 Tab 缩进，并通过主题扩展匹配当前应用的深色/浅色视觉。编辑器容器继续使用现有 `.codeEditor` 类，避免破坏布局。

## 数据流

`EditorPane.value` → CodeMirror 初始文档；用户输入 → `onChange(nextSource)` → `App` 状态 → 现有 `useMermaidRenderer` → 预览 SVG。外部模板切换或本地存储恢复时，反向同步 CodeMirror 文档。

## 兼容与错误处理

- Mermaid 解析错误仍由现有渲染 hook 处理，CodeMirror 不承担语法校验。
- 组件卸载时销毁 `EditorView`，避免 DOM 监听器和状态残留。
- 输入同步只在文档内容不同时执行，避免受控更新循环。
- 不引入 Monaco 或整体 UI 库迁移。

## 验证

使用 Vitest + jsdom 测试编辑器初始内容、用户文档变化回调和外部受控值同步；再运行 `npm run lint`、`npm run build`，并进行浏览器桌面/移动端检查。
