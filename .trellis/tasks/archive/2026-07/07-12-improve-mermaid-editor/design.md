# Mermaid 语法修复助手设计

## 架构决策

在现有的 `useMermaidRenderer` 失败路径中派生诊断数据；不创建第二套独立解析、计时器或 Mermaid 实例。渲染 hook 仍是 SVG、渲染状态和错误的唯一来源，诊断只是 `status: "error"` 的结构化补充。因此，280ms 防抖和请求序号防止陈旧异步结果覆盖最新状态的约定保持不变。

```
source + settings
       |
useMermaidRenderer -- mermaid.parse / render --> ready SVG
       | catch
       v
deriveSyntaxDiagnostic(source, rawError)
       |
RenderState(error + diagnostic)
       |
EditorPane -> SyntaxAssistant -> CodeMirror imperative handle
```

## 数据模型

新增 `src/diagnostics/types.ts`，仅存放前端可序列化模型：

- `DiagramKind`：22 个模板图表类型的稳定标识。
- `SyntaxRepairRule`：`id`、`diagramKind`、`title`、`matches`、`line`、`explanation`、`snippet`。
- `SyntaxDiagnostic`：可选 `line`、友好 `summary`、`manualFixHint`、`rawMessage`、可选 `rule`。

规则目录位于 `src/diagnostics/repairRules.ts`，由 22 组恰好两个规则组成。它以当前 `src/data/examples.ts` 的模板声明为输入事实，且每条规则都附有最小失效样本、期望行号和有效片段。规则不能以 Mermaid 最新网站版本或错误字符串的单一精确格式为唯一依据。

`deriveSyntaxDiagnostic(source, error)` 的优先顺序：

1. 从源码首个非 Frontmatter 的图表声明识别 `DiagramKind`；无法识别时只返回通用诊断。
2. 由规则的源码结构与可选原始错误信号匹配第一个可解释场景，并使用规则定义的 1-based 行号。
3. 对未匹配规则的错误，尝试从 Mermaid 错误文本提取可靠行号；没有可靠位置则保留 `line: undefined`。
4. 返回简短中文解释、要求手动修改的提示和原始错误文本。没有规则时不得编造专属片段。

## 规则覆盖

规则目录严格实现 PRD 表内的 44 项。每一项的安全片段使用 ASCII 标识符及中文标签，例如 `new_node[新节点]`。它只用于参照：即使追加后仍存在原错误，也不改变诊断语义或声称已修复。

当前锁定的 Mermaid 版本必须解析每类模板的有效样本；规则测试对每条失效样本同时验证：(a) 诊断选择正确规则，(b) 行号与解释，(c) 片段可由目标方言接受，(d) 该片段不会通过替换既有文本的方式应用。实验性图表方言的语法变化由依赖升级时的测试失败显式暴露。

## 编辑器边界

`MermaidCodeEditor` 继续是唯一持有 `EditorView` 的组件，并通过 `forwardRef` 暴露最小命令接口：

- `focusLine(line)`：选择/聚焦并滚动到 1-based 行，不改变文档。
- `insertAtCursor(snippet)`：在当前光标处插入。
- `insertAfterLine(line, snippet)`：在指定行末换行追加。

这两个插入方法均通过 CodeMirror transaction 触发受控 `onChange`，让 `App` 仍然拥有源码状态及 localStorage 持久化。外部值同步仍带 `externalUpdate` 标记，不能回触发 `onChange`。插入操作不删除选择区；如果存在选区，在选区起点插入。

## UI 与状态流

新增 `SyntaxAssistant`，由 `EditorPane` 在其底部状态区域中渲染：

- 无错误时保留紧凑的原有成功/渲染状态与统计信息。
- 出现错误时展示可访问的错误区域、可选行号、中文解释、手动修复提示、定位按钮、两个插入按钮，以及 `details` 技术详情和复制按钮。
- `EditorPane` 持有编辑器 ref，负责把诊断动作转为其命令调用；`App` 不直接操作 CodeMirror DOM。
- `PreviewPane` 继续显示错误状态，但删去重复的原始错误内容和修复动作。

桌面端错误助手在编辑器下方展开；移动端顺序不变，按钮可换行，不能让编辑器、预览或底部状态栏横向溢出。

## 兼容性、风险与回滚

- 仅增加纯前端 TypeScript、React、CodeMirror 和 CSS；不增加依赖，不改变导出、Mermaid 初始化、Frontmatter 覆盖或存储键。
- Mermaid 错误位置格式不稳定，因此“无可靠行号”是明确支持的通用状态，而不是 0 行或猜测行。
- 规则目录、失效样本和版本锁定测试使 Mermaid 升级产生可见失败；更新依赖时必须重新验证全部 44 条规则。
- 如需回滚，可删除诊断目录与错误助手集成，并将 `RenderState` 恢复为只含错误消息；现有渲染、编辑和导出路径仍独立存在。
