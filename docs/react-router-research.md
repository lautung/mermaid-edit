# React Router 优化研究

日期：2026-07-13

## 结论摘要

React Router 可以优化这个项目，但不建议把当前单屏 Mermaid 编辑器改造成传统多页面应用。当前最有价值的方向是把“可分享、可回退、可恢复的视图状态”放进 URL，例如模板类型、模板搜索、预览页签、缩放、导出倍率、文件名和语言。

不建议把 Mermaid 源码全文、完整图表设置或导出结果塞进 URL。源码和设置已经通过 localStorage 持久化，且源码可能很长，放进 URL 会带来隐私、长度、编码和分享误操作问题。

推荐采用 React Router 的 Library Mode，并优先从最简单的 Declarative Mode 开始。如果后续要做“模板库独立页面、编辑器页面、示例详情页、文档导入页”等真正路由边界，再评估 Data Router 的 `createBrowserRouter` / `RouterProvider`。

## 当前项目证据

- `package.json` 当前没有 `react-router` 或 `react-router-dom` 依赖，项目仍是纯 React 单入口应用。
- `src/main.tsx` 直接渲染 `<App />`，没有 router provider。
- `src/App.tsx` 目前集中管理：
  - `source`：localStorage key 为 `mermaid-edit:source`
  - `settings`：localStorage key 为 `mermaid-edit:settings`
  - `locale`：localStorage key 为 `mermaid-edit:locale`
  - `selectedType`、`search`、`scale`、`zoom`、`filename`
  - Markdown 导入弹窗、模板管理弹窗
- `src/components/PreviewPane.tsx` 已经有预览、导出检查、错误三个 tab，但当前 tab 没有受控状态，也无法通过 URL 恢复。
- `src/components/TemplateSidebar.tsx` 的模板类型和搜索词完全是内存态，刷新后会丢失。
- npm registry 在本次研究时返回 `react-router` 最新版本为 `8.2.0`，`react-router-dom` 最新版本为 `7.18.1`。实现时复核发现 `react-router@8.2.0` 要求 React `>=19.2.7` 和 Node `>=22.22.0`，不适合本项目当前 React 18 / Node 20+ 工具链；本次落地选择 `react-router@7.9.4`，其 peer dependency 为 React `>=18`。

## 官方资料要点

- React Router 官方文档将 React Router 描述为可用作 Framework Mode 或 Library Mode 的路由方案；Library Mode 又包含 Data Mode 和 Declarative Mode。
- 官方模式选择建议中，Declarative Mode 适合“想尽可能简单地使用 React Router”的场景；Data Mode 适合需要 loader/action 等数据能力并希望控制 bundling、data、server abstraction 的场景。
- 官方 Declarative Mode 示例从 `react-router` 导入 `BrowserRouter`、`Routes`、`Route`。
- 官方 Data Router 示例使用 `createBrowserRouter` 创建 route config，并用 `RouterProvider` 渲染。
- 官方 `useSearchParams` 文档支持读取和更新 URL query，例如 `searchParams.get("q")`、`setSearchParams({ tab: "1" })`。
- 官方状态管理说明建议，对适合表达为 URL 的 view state，可以直接通过 search params 管理，而不是再做一层 React state 与 URL 的同步。
- 官方 lazy route 文档支持在 route object 上使用 `lazy` 动态导入 route component / loader，用于按路由拆分代码。

## 适合路由化的状态

### P0：URL query 管理轻量视图状态

建议先只做 query string，不拆页面：

```text
/?type=flowchart&q=login&tab=preview&zoom=100&scale=2&filename=mermaid-diagram
```

候选参数：

- `type`：模板类型，对应 `selectedType`
- `q`：模板搜索词，对应 `search`
- `tab`：预览区 tab，可选 `preview` / `export` / `error`
- `zoom`：预览缩放，限制在 `50..200`
- `scale`：导出倍率，限制在 `1..4`
- `filename`：导出文件名，进入导出工具前仍需复用现有 sanitize 逻辑
- `lang`：可选。如果希望分享链接带界面语言，可映射到已有 locale；如果不希望 URL 覆盖用户偏好，就继续只用 localStorage。

收益：

- 用户可以复制当前工作台视图链接。
- 浏览器前进/后退能恢复筛选、tab、缩放等轻量状态。
- 刷新页面后无需完全依赖 localStorage 恢复临时视图。
- 后续截图、文档和测试可以直接用 URL 定位特定状态。

风险：

- `useSearchParams` 的更新会产生导航记录，连续拖动缩放 slider 时可能污染 history。缩放这类高频状态应使用 replace 语义或只在交互结束时写 URL。
- query 参数必须做 runtime normalize，不能直接信任 URL。
- URL 状态与 localStorage 状态要有优先级规则，建议 URL 只覆盖轻量视图态，源码和完整设置仍以 localStorage 为主。

### P1：给工作台增加有限路由边界

如果后续要扩展功能，可以增加这些 route，但不需要现在就做：

```text
/             编辑器工作台
/templates    模板管理或模板库全屏视图
/import       Markdown 导入深入口
/examples/:id 单个模板示例深链接
```

收益：

- 模板管理弹窗可以演进成页面，减少 `App.tsx` 的 modal 状态。
- `examples/:id` 可以让某个模板有稳定链接。
- 大功能可以按 route lazy loading 拆包。

风险：

- 当前应用的核心工作流是“编辑器 + 预览 + 设置”同屏协作，强行拆页面会降低效率。
- 模板管理目前只是 modal，单独路由会增加导航、关闭/返回、移动端布局等状态处理成本。

### P2：按路由 lazy loading

只有在出现真正独立页面时，再使用 React Router 的 `lazy` route。当前首屏重依赖主要来自 Mermaid、ELK、Ant Design、CodeMirror 和 canvg，单纯引入 React Router 不会自动解决这些 bundle 问题。

若只做 query 状态，首屏性能优化仍应沿用已有 `docs/optimization-research.md` 的方向：动态导入导出链路、拆分 Mermaid/ELK、评估 manual chunks。

## 不建议路由化的状态

- Mermaid 源码全文：内容可能很长，也可能包含用户私有业务图。
- 完整 `settings` JSON：已有 localStorage，且 URL 参数会让 schema 迁移更复杂。
- SVG / PNG / JPG 导出结果：项目边界是浏览器本地导出，不需要 URL 表达二进制产物。
- 临时弹窗开关：`markdownImportOpen`、`templateManagerOpen` 可以暂时保留为组件内状态；除非它们升级为正式页面。

## 推荐实施方案

### 阶段 1：引入最小 Declarative Router

目标：为 `useSearchParams` 提供上下文，不改变现有页面结构。

建议：

1. 安装兼容当前 React 18 工具链的 `react-router` 7.x 版本；不要直接跟随 React Router 8.x，除非项目同步升级 React 和 Node 要求。
2. 在 `src/main.tsx` 或 `src/App.tsx` 外层增加 `BrowserRouter`。
3. 保持唯一主路由 `/` 渲染现有 `App`。
4. 不引入 loader/action/server 概念。

验收：

- 现有编辑、渲染、导出行为不变。
- `npm test -- --run`、`npm run lint`、`npm run build` 通过。

### 阶段 2：抽 URL 状态 hook

目标：把 URL 参数解析和归一化从组件中隔离出来。

建议新增类似 `src/hooks/useEditorSearchParams.ts`：

- 读取 query 参数。
- 对 `type`、`tab`、`zoom`、`scale`、`filename` 做白名单和范围校验。
- 暴露更新方法，内部决定 push / replace。
- 不处理 Mermaid 源码和完整 settings。

这一步应该补 hook 测试，覆盖非法参数回退，例如：

- `zoom=999` 回退到 `100` 或 clamp 到 `200`
- `scale=abc` 回退到 `2`
- `tab=unknown` 回退到 `preview`
- `type` 不在模板类型中时回退到默认类型

### 阶段 3：让组件使用 URL 状态

优先替换低风险状态：

1. `selectedType`
2. `search`
3. 预览 tab
4. `zoom`
5. `scale`
6. `filename`

源码、settings、locale 先不动。locale 是否进入 URL 应单独决策，因为当前用户偏好已经通过 localStorage 保存。

### 阶段 4：再评估页面级路由

只有当模板管理、导入、示例详情变成较完整页面时，再引入：

- `/templates`
- `/import`
- `/examples/:id`
- route lazy loading

否则 React Router 的角色应保持在“URL 状态管理”层面。

## 对项目的实际优化判断

值得做，但不是最高优先级性能优化。

React Router 能优化的是：

- 可分享工作台视图
- 浏览器历史记录体验
- 刷新后的轻量状态恢复
- 后续功能边界和 route-level lazy loading 的基础

React Router 不能直接优化的是：

- Mermaid 渲染耗时
- 首屏 Mermaid / CodeMirror / Ant Design bundle 体积
- PNG/JPG 导出链路
- localStorage 容错

因此推荐优先级是 P1：在完成当前性能和导出链路优化后实施。如果当前产品目标是“分享某个模板筛选/预览状态链接”，可以提前做阶段 1 和阶段 2。

## 参考来源

- React Router 官方 Modes：Framework Mode、Data Mode、Declarative Mode 的适用场景。https://github.com/remix-run/react-router/blob/main/docs/start/modes.md
- React Router 官方 Declarative Routing：`BrowserRouter`、`Routes`、`Route` 示例。https://reactrouter.com/start/declarative/routing
- React Router 官方 URL Values：使用 `useSearchParams` 读取 URL search params。https://reactrouter.com/start/declarative/url-values
- React Router 官方 `useSearchParams` API：`setSearchParams` 支持字符串、对象、数组、`URLSearchParams` 和 callback。https://reactrouter.com/api/hooks/useSearchParams
- React Router 官方 State Management：适合 URL 表达的 view state 可直接用 search params 管理。https://reactrouter.com/explanation/state-management
- React Router 官方 Route Object / lazy：通过 route `lazy` 动态加载 route properties。https://reactrouter.com/start/data/route-object
- npm registry 查询：`npm view react-router version` 本次返回 `8.2.0`，`npm view react-router-dom version` 本次返回 `7.18.1`；`npm view react-router@8.2.0 peerDependencies engines` 显示其要求 React `>=19.2.7` 和 Node `>=22.22.0`，`npm view react-router@7.9.4 peerDependencies engines` 显示其兼容 React `>=18` 和 Node `>=20.0.0`。
