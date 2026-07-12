# 补全 Mermaid 编辑器能力

## Goal

在保留现有实时渲染、CodeMirror 编辑器和本地导出的基础上，补齐 Mermaid 编辑器最常用的三类能力：更完整的图表模板发现、可操作的 Mermaid 渲染配置、Markdown Mermaid 代码块导入与导出。

用户价值：用户不仅可以直接输入 Mermaid 代码，还能快速找到不同图表类型的示例，调整图表外观，并把图表代码带入或带出 Markdown 文档。

## Background and confirmed facts

- 项目使用官方 `mermaid` npm 包，当前代码通过 `mermaid.initialize`、`mermaid.parse` 和 `mermaid.render` 完成单图实时渲染。
- 当前模板数据集中在 `src/data/examples.ts`，界面按模板数据派生图表类型和模板列表，因此 Mermaid 库支持的图表类型不会自动成为可发现的模板分类。
- 当前已支持 SVG、PNG、JPG 导出；编辑内容通过 `useLocalStorage` 保存，但没有 Markdown 文件导入/导出流程。
- 编辑器中已经预留“Markdown 导入”标签，但当前处于 disabled 状态。
- Mermaid 渲染主题目前由 `src/hooks/useMermaidRenderer.ts` 中的固定配置和 `src/App.tsx` 中的主题选择共同控制。
- 本任务属于前端单仓库工作，必须保持纯浏览器本地处理，不引入后端、账号系统或远程存储。

## Requirements

### R1. 完整模板发现

- 在现有模板库基础上补充 Mermaid 官方文档中常用且当前项目尚未覆盖的 14 个图表类型模板：饼图、象限图、需求图、思维导图、时间线、Sankey、XY Chart、Block、Packet、Kanban、Architecture、Radar、Treemap、Venn。
- 每个模板必须包含可直接渲染的 Mermaid 源码、中文标题、图表类型和搜索标签。
- 用户仍可在编辑器中输入模板库之外的 Mermaid 语法；模板分类只是发现和示例入口，不得限制渲染器。
- 模板列表搜索和分类切换必须继续适配移动端布局。

### R2. Mermaid 配置面板

- 提供可视化配置入口，至少支持主题、背景色、字体、图表布局和连线曲线等常用渲染选项。
- 配置变化应实时作用于当前预览，并保留现有的 debounce、错误状态和导出流程。
- 配置状态必须与当前编辑内容一起持久化到浏览器本地存储；刷新后恢复。
- 对 Mermaid 不支持或高风险的安全配置不开放为用户可编辑项，继续保持当前安全边界。
- 代码中的 Mermaid frontmatter 配置需要有明确的优先级规则，不能因为新增面板而静默覆盖用户源代码配置；采用 Mermaid 官方语义，源码中显式声明的配置优先于配置面板，面板作为默认配置，并在冲突时提示用户。

### R3. Markdown 导入与导出

- 启用现有“Markdown 导入”入口，支持粘贴 Markdown 文本或选择本地 `.md` 文件，从 fenced code block 中识别 `mermaid` 代码块。
- 当 Markdown 中存在多个 Mermaid 代码块时，允许用户选择目标代码块后载入编辑器。
- 对不存在 Mermaid 代码块、空内容和格式错误提供可理解的错误提示，不破坏当前编辑内容。
- 增加 Markdown 导出，将当前 Mermaid 源码包装为标准 ` ```mermaid ` fenced code block并下载为 `.md` 文件。
- 导入和导出均在浏览器本地完成，不上传源代码。

## Constraints and out of scope

- 本任务不实现多人协作、账号、云端存储、Gist、分享链接、AI 生成或拖拽式图形编辑。
- 本任务不替换官方 Mermaid 渲染器，不自研图表语法解析器。
- 本任务不要求一次性为每种 Mermaid 图表实现专属编辑表单；模板和通用配置面板优先。
- 现有 SVG、PNG、JPG 导出和 CodeMirror 编辑能力不得回归。

## Acceptance Criteria

- [ ] 模板库新增的图表类型均能通过点击载入，并在有效源码下显示预览；已有模板仍可用。
- [ ] 模板搜索、分类切换、移动端布局和本地源代码保存行为不回归。
- [ ] 配置面板至少能修改主题、背景色、字体、布局和曲线，并实时反映到预览和导出结果。
- [ ] 配置项在刷新后恢复；源代码中的 Mermaid frontmatter 配置按明确规则处理并有测试覆盖。
- [ ] 可从包含一个或多个 Mermaid fenced code block 的 Markdown 文本导入，多个代码块可选择。
- [ ] 无 Mermaid 代码块或无效输入会提示错误且保留原编辑内容。
- [ ] 当前源码可导出为可再次导入的 `.md` 文件，代码块语言标记为 `mermaid`。
- [ ] `npm test -- --run`、`npm run lint` 和 `npm run build` 通过。
- [ ] Chrome 浏览器验证有效/无效 Mermaid 输入、配置变化、Markdown 导入导出，以及 390px 左右视口无横向溢出。
