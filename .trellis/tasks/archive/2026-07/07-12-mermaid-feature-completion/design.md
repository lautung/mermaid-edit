# 技术设计：补全 Mermaid 编辑器能力

## Architecture and boundaries

保持当前“React 状态 + Mermaid 官方 API + 浏览器本地存储”的前端架构，不引入后端或远程服务。实现拆成三个边界清晰的模块：

1. `src/data/examples.ts` 扩展模板数据，只负责示例源代码和分类元数据。
2. `src/hooks/useMermaidRenderer.ts` 接收一个可持久化的渲染配置对象，负责把默认配置交给 Mermaid 并返回渲染状态；Mermaid 源码中的 Frontmatter 继续由 Mermaid 官方渲染流程解析。
3. 配置面板和 Markdown 导入/导出使用独立组件与纯函数工具，避免把文件读取、代码块解析和配置合并逻辑塞入 `App.tsx`。

## State and data flow

- `source` 继续由 `useLocalStorage("mermaid-edit:source", ...)` 控制。
- 新增 `DiagramSettings`，至少包含 `theme`、`background`、`fontFamily`、`layout`、`curve`，通过 `useLocalStorage("mermaid-edit:settings", defaults)` 持久化。
- `App` 将 `source` 和 `DiagramSettings` 传入 `useMermaidRenderer`，配置变化触发同一套 debounce 渲染流程。
- 预览画布使用 `background` 设置；导出工具接收同一个背景值，确保透明/颜色预览与 PNG/JPG 输出一致。
- Markdown 导入先解析为 `MarkdownMermaidBlock[]`，用户选择目标块后才调用 `setSource`，任何解析失败都不覆盖当前源码。

## Mermaid configuration and precedence

- 面板配置作为 site-level/default configuration 传给 `mermaid.initialize`。
- 源码中的 Frontmatter 按 Mermaid 官方语义覆盖面板中同名的可覆盖字段。
- 使用一个轻量的 Frontmatter 检测工具，仅用于识别面板中的哪些字段被源码显式覆盖并显示提示；实际配置解析和最终渲染仍交给 Mermaid，避免重复实现 Mermaid 配置合并规则。
- `securityLevel` 继续固定为 `strict`，不在面板开放安全配置。
- 布局提供 `dagre` 和 `elk` 两个选项；ELK 通过官方 layout loader 注册，注册失败时显示错误并回退到 `dagre`。

## Markdown contract

- 识别标准 fenced code block：开头为 ` ```mermaid `（允许首尾空格和大小写不敏感），结束为单独的 ` ``` `。
- 导入结果至少包含代码块序号、源码、前后文摘要，供多块选择界面展示。
- 导出固定使用 ` ```mermaid ` 包裹当前源码，并附带最终换行，文件扩展名为 `.md`。
- 文件读取使用浏览器 `File.text()`；不发送网络请求。

## Compatibility and rollback

- 保留现有模板、编辑器、实时预览和 SVG/PNG/JPG 导出 API，不改变父子组件的 `value/onChange` 合约。
- 新增配置存储使用独立 key，旧用户没有配置时使用当前主题和导出行为对应的默认值。
- 若 ELK 或某个新模板在浏览器中失败，单个模板应显示现有错误状态，不影响其他模板和手写源码。
- 任何新功能可通过删除对应 UI 入口回滚；不需要数据迁移或服务端回滚。

## Risks and trade-offs

- 配置面板会增加 Mermaid 配置对象的类型和测试量；只开放高频、安全的字段，避免暴露完整配置树。
- Frontmatter 检测与 Mermaid 内部解析存在重复边界，因此检测工具只做覆盖提示，不参与最终渲染合并。
- ELK 会增加客户端包体积；仅在用户选择 ELK 时加载或注册，默认仍用 dagre。
