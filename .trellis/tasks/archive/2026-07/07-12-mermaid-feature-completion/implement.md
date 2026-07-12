# 实施计划：补全 Mermaid 编辑器能力

## Ordered checklist

### 1. 类型与持久化基础

- [x] 扩展 `src/types.ts`，定义 `DiagramSettings`、Markdown 代码块和模板元数据所需类型。
- [x] 增加默认配置和独立 localStorage key，确保旧数据兼容。
- [x] 先补纯函数测试：默认值、配置序列化/恢复、Frontmatter 覆盖字段检测。

### 2. Mermaid 模板

- [x] 为 14 个新增常用图表类型补充可直接渲染的中文模板和标签。
- [x] 为模板数据增加稳定的类型标识，保持现有搜索、分类和移动端布局。
- [x] 增加模板 smoke test，逐个验证模板源代码可被 Mermaid 解析；解析失败的类型使用官方可运行示例修正。

### 3. 配置面板与渲染链路

- [x] 将现有内联设置区域提取或重构为可测试的配置面板组件。
- [x] 支持主题、背景色、字体、布局和连线曲线，背景默认透明。
- [x] 更新 `useMermaidRenderer` 传递配置，保持 debounce、竞态保护和现有错误状态。
- [x] 让预览画布和 PNG/JPG 导出复用同一个背景配置。
- [x] 对源码 Frontmatter 冲突字段显示覆盖提示，并测试源码优先规则。
- [x] 如引入 ELK，使用官方 loader 并验证 dagre 默认路径不受影响。

### 4. Markdown 导入/导出

- [x] 新增 Markdown fenced code block 解析工具和单元测试。
- [x] 启用“Markdown 导入”入口，支持粘贴文本和选择本地 `.md` 文件。
- [x] 多代码块提供选择界面；无代码块、空内容和读取失败提供错误提示并保留原源码。
- [x] 增加 Markdown 导出动作，验证导出内容可再次导入。

### 5. 质量验证与文档

- [x] 更新 README 或项目文档，说明模板、配置和 Markdown 能力。
- [x] 运行 `npm test -- --run`。
- [x] 运行 `npm run lint`。
- [x] 运行 `npm run build`。
- [x] 使用 Chrome 验证有效/无效 Mermaid 输入、模板载入、配置实时变化、源码 Frontmatter 覆盖、Markdown 导入/导出和 390px 左右视口无横向溢出。
- [x] 更新前端 Trellis 规范，记录新增组件、状态和测试约定。

## Validation commands

```powershell
npm test -- --run
npm run lint
npm run build
```

## Risky files and rollback points

- 高风险文件：`src/App.tsx`、`src/hooks/useMermaidRenderer.ts`、`src/utils/exportDiagram.ts`、`src/styles.css`。
- 第一回滚点：模板数据和纯函数工具完成后，先确认不改变现有渲染流程。
- 第二回滚点：配置面板接入后，确认旧模板、错误状态和导出背景一致。
- 第三回滚点：Markdown 导入/导出接入后，确认失败输入不会覆盖已有源码。
