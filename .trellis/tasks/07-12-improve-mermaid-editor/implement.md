# Mermaid 语法修复助手实施计划

## 实施顺序

1. 建立可测试的诊断模型与规则目录。
   - 新建 `src/diagnostics/types.ts`、`src/diagnostics/repairRules.ts`、`src/diagnostics/deriveSyntaxDiagnostic.ts`。
   - 从 `src/data/examples.ts` 导出或集中维护 22 个稳定图表标识，避免在组件中按中文展示名分支。
   - 为每类添加两条规则、失效源码夹具和安全片段；测试总数为 44，且测试中断言每类恰有两条。
   - 为 Mermaid 11.4.1 解析编写有效模板回归和失效样本诊断测试。

2. 在不破坏异步渲染约定的前提下丰富渲染错误状态。
   - 扩展 `src/types.ts` 的错误状态，使其可选携带 `SyntaxDiagnostic` 与原始错误消息。
   - 修改 `src/hooks/useMermaidRenderer.ts`：仅在当前请求捕获解析/渲染错误时调用 `deriveSyntaxDiagnostic`；成功和 idle 状态不得携带陈旧诊断。
   - 扩展 `src/hooks/useMermaidRenderer.test.tsx`，覆盖专属诊断、通用无行号诊断、修复后收起以及陈旧错误不能覆盖最新成功/idle 状态。

3. 为 CodeMirror 添加受控的定位与追加命令。
   - 修改 `src/components/MermaidCodeEditor.tsx`，通过 `forwardRef`/`useImperativeHandle` 暴露聚焦行、光标插入和错误行后插入。
   - 保留现有外部同步标记；插入必须通过用户动作路径触发 `onChange`，外部同步不得产生反馈循环。
   - 扩展 `src/components/MermaidCodeEditor.test.tsx`，验证 1-based 定位、两个插入位置、保留原文与选区不被替换。

4. 实现错误助手并集成编辑器与预览。
   - 新建 `src/components/SyntaxAssistant.tsx` 及聚焦的组件测试，覆盖错误摘要、行号、手动修复提示、技术详情展开与复制、定位、两种插入和无专属规则状态。
   - 修改 `src/components/EditorPane.tsx`：持有编辑器 ref，渲染助手并连接操作；正常状态维持现有统计信息。
   - 修改 `src/components/PreviewPane.tsx`：错误时只显示简短状态，移除与编辑器重复的修复内容。
   - 修改 `src/styles.css`，实现桌面可展开面板、按钮换行和移动端无溢出布局。

5. 完成回归与浏览器验证。
   - 运行 `npm test -- --run`、`npm run lint`、`npm run build`。
   - 在 Chrome 验证：有效图渲染、每类至少一个失效夹具的专属诊断、模板范围外通用诊断、定位、两种插入、技术详情复制、逐个错误修复、导出恢复，以及 390px 视口无横向溢出。
   - 检查 `git diff`，确保不提交 `dist`、运行时缓存、临时文件或密钥。

## 评审门槛

- 在第 1 步结束前，规则表、44 个夹具和 Mermaid 本地解析结果必须相互一致。
- 在第 3 步结束前，CodeMirror 的受控输入、外部同步和光标/选区行为测试必须通过。
- 在第 4 步结束前，错误助手没有自动改写源码的路径；所有插入均为显式按钮操作。
- 只有在第 5 步的自动化和 Chrome 验证均通过后，才可以进入 Trellis 质量检查、规格更新和提交阶段。

## 回滚点

- 诊断目录和错误状态扩展是独立增量；若规则或 UI 不可靠，可先撤销其集成，不影响现有 Mermaid 渲染、导出、模板和本地保存。
- CodeMirror 命令接口在集成前单独测试；若其引入受控同步问题，先回滚接口与按钮连接，保留既有编辑器。
