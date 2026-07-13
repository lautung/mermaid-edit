# Mermaid 在线编辑器优化探索

日期：2026-07-13

## 结论摘要

当前项目的核心体验已经完整：浏览器本地编辑、实时 Mermaid 预览、SVG / PNG / JPG / Markdown 导出、模板库、国际化、语法诊断和基础测试都已具备。最值得优先投入的优化不是继续加功能，而是降低首屏成本、减少无效渲染、补齐导出和本地存储的失败路径。

本次验证命令：

```bash
npm run build
```

结果：构建通过，但 Vite 输出大 chunk 警告。主要产物包括：

- `dist/assets/index-Don960Mz.js`：2,144.92 kB，gzip 647.98 kB
- `dist/assets/render-X3XFXER2-a-ItZeP6.js`：1,452.67 kB，gzip 445.68 kB
- `dist/assets/cynefin-VYW2F7L2-DvZuHIJg.js`：690.56 kB，gzip 155.09 kB
- `dist/assets/cytoscape.esm-CUqq0XTU.js`：443.69 kB，gzip 142.35 kB

Vite 官方建议对大 chunk 优先考虑 `dynamic import()` 和 `build.rollupOptions.output.manualChunks`。这和当前源码里的静态重依赖导入直接对应。

## P0：降低首屏 bundle 体积

### 证据

- `src/hooks/useMermaidRenderer.ts` 顶层静态导入 `mermaid` 和 `@mermaid-js/layout-elk`，并在模块加载时执行 `mermaid.registerLayoutLoaders(elkLayouts)`。
- `src/utils/exportDiagram.ts` 顶层静态导入 `Canvg`，即使用户只编辑或只导出 SVG，也会把 raster 导出依赖纳入主依赖图。
- `vite.config.ts` 只有默认 `build.outDir`，没有 chunk 分组策略。
- `src/components/Toolbar.tsx` 当前未被引用，但它是 `lucide-react` 的唯一源码引用；`package.json` 仍保留 `lucide-react` 依赖。

### 建议

1. 删除未使用的 `src/components/Toolbar.tsx`，并移除 `lucide-react` 依赖。
2. 把 `canvg` 改成 `downloadRaster()` 内部动态导入，只有 PNG/JPG 导出时加载。
3. 评估 `@mermaid-js/layout-elk` 是否只在选择 `layout: "elk"` 时注册或加载。
4. 为 Vite 增加清晰的 `manualChunks`，先把 Ant Design、CodeMirror、Mermaid、导出链路拆开，便于浏览器缓存和后续定位。

### 风险

Mermaid 的图表实现本身已经会拆出许多动态 chunk。手工分包不应破坏 Mermaid 的内部动态加载，改动后必须复测 Mermaid 多图表类型和 chunk-load retry 路径。

## P0：减少无效 Mermaid 渲染

### 证据

- `useMermaidRenderer()` 的 effect 依赖是 `[localeMessages, source, settings]`。
- `App.tsx` 中 `rendererLocale` 会随当前语言的 `messages` 和 `diagnosticMessages` 变化。
- 语言切换会重新触发 `mermaid.initialize()`、`mermaid.parse()` 和 `mermaid.render()`，即使源码和渲染设置都没有变化。
- effect 内每次执行都会调用 `mermaid.initialize()`，源码输入变化时也会重新初始化 Mermaid。

### 建议

1. 把 Mermaid 初始化 effect 拆出来，只依赖 `settings`。
2. 把实际渲染 effect 限定为 `source` 和渲染相关设置变化。
3. 将展示文案和语法诊断翻译从渲染请求生命周期里拆出，避免纯语言切换触发图表重算。
4. 可进一步引入 React `useDeferredValue` 或等价策略，让编辑输入优先响应，渲染使用延迟后的源码。

### 风险

错误诊断依赖当前语言文案。拆分后要保证当用户切换语言时，已有错误提示能更新语言，但不重新发起 Mermaid 渲染请求。

## P1：补齐导出链路边界和测试

### 证据

- `src/utils/exportDiagram.ts` 当前没有对应测试。
- `exportDiagram.ts` 的 `getDimensionsFromViewBox()` 使用 `viewBox.split(/\s+/)`，不支持逗号分隔。
- `src/components/PreviewPane.tsx` 的 `getSvgDimensions()` 支持 `split(/[\s,]+/)`，预览和导出的 SVG 尺寸解析能力不一致。
- `downloadSvg()` 没有复用 `sanitizeFilename()`，PNG/JPG 导出有文件名清理。

### 建议

1. 提取共享 SVG 尺寸解析工具，预览和导出共用。
2. 补 `src/utils/exportDiagram.test.ts`，覆盖：
   - 空格和逗号格式 `viewBox`
   - 缺少尺寸时 fallback
   - JPG 透明背景转白底
   - 非法文件名清理
   - `canvas.getContext()` 不可用
   - `canvas.toBlob(null)` 失败
3. 让 SVG、PNG、JPG 的文件名清理规则一致。

## P1：增强 localStorage 容错和设置迁移

### 证据

- `src/hooks/useLocalStorage.ts` 和 `src/hooks/useJsonLocalStorage.ts` 直接调用 `window.localStorage.getItem()` / `setItem()`。
- 浏览器禁用本地存储、隐私模式、quota exceeded 时可能抛错。
- `useJsonLocalStorage<T>` 只做 `JSON.parse`，没有运行时 schema 校验。
- `DiagramSettings` 是 TypeScript union，但旧缓存或手动篡改的 localStorage 仍可能传入非法 `theme`、`layout`、`curve`、`fontFamily`。

### 建议

1. 增加 `safeStorage` 包装，读写都 `try/catch`。
2. 为 `DiagramSettings` 增加 normalize / migrate 函数，坏值回落到 `defaultDiagramSettings`。
3. 补本地存储 hook 测试：坏 JSON、非法 setting、读取抛错、写入抛错。

## P1：拆窄 `App.tsx` 的职责边界

### 证据

`MermaidEditorApp()` 同时负责：

- 模板筛选和模板选择
- 顶部语言、复制、导出、重置按钮
- 导出菜单和导出通知
- Markdown 导入弹窗和模板管理弹窗
- settings、scale、zoom、filename、source 等状态
- 桌面 / 移动布局分支

这会让后续优化渲染、导出或模板时都集中修改同一个大组件。

### 建议

按功能边界逐步拆分，不做一次性大重构：

1. 抽 `useExportActions()`，承接 SVG / raster / Markdown / copy 逻辑。
2. 抽 `TemplateSidebar`，承接模板分类、搜索、列表和管理入口。
3. 抽 `HeaderActions`，承接语言选择、复制、导出、恢复模板。
4. 如后续继续扩展，再抽 `useEditorState()` 管理 source/settings/localStorage。

## P2：减少设置面板重复解析

### 证据

- `src/components/SettingsPanel.tsx` 每次 render 都调用 `getOverriddenKeys(source)`。
- `getOverriddenKeys()` 内部调用 `getFrontmatterOverrides(source)`，会解析 YAML frontmatter。
- 缩放、文件名和局部 UI 更新也会触发这次解析。

### 建议

在 `SettingsPanel` 内用 `useMemo(() => getOverriddenKeys(source), [source])`。如果后续多个组件都需要 frontmatter override 信息，再把该派生状态上移到编辑器状态层。

## P2：清理旧代码和硬编码文案

### 证据

- `src/components/Toolbar.tsx` 当前没有被引用，并包含中文硬编码文案。
- `src/components/MarkdownImportModal.tsx` 的 placeholder 仍硬编码 Mermaid 示例文本。
- 项目规范要求用户可见文案不要在组件中硬编码，应走 `src/i18n/messages.ts`。

### 建议

1. 删除未使用的 `Toolbar.tsx`。
2. 将 Markdown 导入 placeholder 移入 `messages.ts`，补齐各语言文案。

## 建议实施顺序

1. **快速清理**：删除未使用 Toolbar / lucide-react，给 `SettingsPanel` 加 `useMemo`。
2. **导出安全网**：补 `exportDiagram` 测试并统一 SVG 尺寸解析。
3. **首屏体积优化**：动态导入 `canvg`，再评估 Mermaid / ELK 分包。
4. **渲染生命周期优化**：拆分初始化、渲染、语言文案更新。
5. **状态持久化增强**：safe localStorage + settings normalize/migrate。
6. **组件边界重整**：抽 `useExportActions`、`TemplateSidebar`、`HeaderActions`。

## 验收建议

每轮优化至少运行：

```bash
npm test -- --run
npm run lint
npm run build
```

涉及 UI、导出、响应式或截图时，还需要在真实 Chrome 中验证：

- 桌面编辑和预览
- `390x844` 移动布局
- SVG / PNG / JPG 导出成功
- 语法错误时导出禁用
- 多图表类型，尤其是 `stateDiagram-v2`、`kanban`、`architecture-beta`、`elk` 布局

## 参考来源

- Vite 官方构建选项：`build.chunkSizeWarningLimit`、module preload、构建配置说明。https://vite.dev/config/build-options
- Vite 官方资料建议通过 `build.rollupOptions.output.manualChunks` 配置 chunk 拆分。https://vite.dev/llms-full.txt
- Mermaid 官方 Usage：Mermaid 是基于文本定义渲染图表的 JavaScript 工具，可通过修改描述重新渲染。https://mermaid.js.org/config/usage.html
- Mermaid 官方语法参考：`initialize()` 用于 API 或 script 集成，frontmatter 可在图表源码前重配置渲染行为。https://mermaid.js.org/intro/syntax-reference.html
- Mermaid API 参考：官方建议需要细粒度渲染时使用 `parse` 和 `render`，而不是页面加载式 init 流程。https://mermaid.js.org/config/setup/mermaid/interfaces/Mermaid.html
- React 官方 `useDeferredValue`：可让 UI 在慢渲染场景下优先响应输入，并延迟昂贵派生视图更新。https://react.dev/reference/react/useDeferredValue
- CodeMirror 官方说明：CodeMirror 是浏览器代码编辑器组件，并提供可扩展 API。https://codemirror.net/
- CodeMirror 参考手册：CodeMirror 6 以多个 `@codemirror` 包发布，需通过 bundler 或 loader 在浏览器运行。https://codemirror.net/docs/ref/
