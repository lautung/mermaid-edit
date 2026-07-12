# 技术设计：Mermaid 编辑器架构评审

## 评审对象

以当前 `src/` 为实现范围，重点追踪以下调用关系：

- `src/App.tsx` 的页面状态与事件编排；
- `src/components/EditorPane.tsx`、`PreviewPane.tsx`、`Toolbar.tsx`、`SettingsPanel.tsx`、`StatusBar.tsx` 的 UI module interface；
- `src/hooks/useMermaidRenderer.ts`、`useLocalStorage.ts`、`useJsonLocalStorage.ts` 的状态/副作用 seam；
- `src/utils/mermaidConfig.ts`、`markdownMermaid.ts`、`exportDiagram.ts` 的纯逻辑和浏览器适配 seam；
- `src/types.ts`、`src/data/settings.ts`、`src/data/examples.ts` 的共享数据 interface。

## 评审方法

1. 从 `App` 开始向下跟踪数据和事件，标注状态所有权以及跨 module 的参数传递。
2. 识别 interface 近似等于 implementation 的 shallow module，并应用 deletion test。
3. 识别渲染、持久化、剪贴板、下载、canvas 等副作用与核心逻辑混在一起的 seam。
4. 以现有测试为 test surface，判断测试是否能通过 module interface 覆盖真实行为。
5. 将多个相互独立、可验证的候选整理成 HTML 卡片，不把候选直接变成重构指令。

## 设计约束与取舍

- 评审结果必须描述当前事实，不能把既有 Ant Design/CodeMirror 设计文档中尚未实现的内容当作现状。
- 一个 adapter 只能说明 hypothetical seam；只有发现两个真实 adapter 或明确的测试替代物，才把 seam 标为强候选。
- 对纯函数抽取保持谨慎：如果真实 bug 位于调用顺序、状态同步或浏览器副作用中，仅抽取函数不会增加 locality。
- 候选按 leverage、locality、接口收缩幅度和测试收益排序，而不是按文件数量排序。

## 已确认的候选 01 范围

- 只深化渲染请求协调：debounce、请求新旧判断、过期结果过滤和最终状态提交集中处理。
- Mermaid 初始化、主题、布局、Frontmatter 和导出保持现有行为，不在本次候选中重新设计。
- 预览在最新请求渲染期间继续保留当前可用 SVG；这与现有产品设计的“保留上一张图并叠加渲染状态”一致。
- 过期请求无论成功还是失败都不能提交状态；只有当前请求可以提交 ready、error 或 idle。

## 当前推荐、待用户确认的边界

- 已确认把“最新输入为空时取消在途结果”作为与快速输入相同的验收场景；清空编辑器后旧图不能回来。
- 已确认通过 hook 的公开 `{ svg, state }` 结果补充旧请求晚返回、旧请求报错和空输入三种自动化回归测试。

## 测试 seam

- 测试通过 `useMermaidRenderer` 的公开返回值 `{ svg, state }` 验证用户可见行为，不直接测试私有的 `renderDiagram`。

## 输出结构

生成一个独立 HTML 文件，使用 Tailwind CDN 和 Mermaid CDN 展示：

- 项目上下文、扫描范围和术语图例；
- 每个候选的文件、问题、方案、收益、测试面、推荐强度；
- before/after 图示，使用 Mermaid 依赖图或手工结构图；
- Top recommendation 及其选择理由。

HTML 不作为项目运行时资源，不进入 Git。
