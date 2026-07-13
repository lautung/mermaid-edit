# React Router 最新版 Framework Mode 升级方案

日期：2026-07-13

## 结论摘要

这份方案以当前 npm 最新版本为目标，而不是以当前项目已安装的 `react-router@7.9.4` 为目标。

截至本次核对，最新版本链路是：

- `react-router@8.2.0`
- `@react-router/dev@8.2.0`
- `react@19.2.7`
- `react-dom@19.2.7`
- `vite@8.1.4`
- `@vitejs/plugin-react@6.0.3`
- `typescript@6.0.3`

关键判断：React Router 8 不能在当前项目的 React 18 / Vite 5 基线上直接升级。必须先升级 React、ReactDOM、Vite 和相关测试/构建工具链，再切换 React Router Framework Mode。虽然 npm 的 TypeScript 最新标签是 7.x，但当前 React Router 8 和 TypeScript ESLint 的兼容交集是 TypeScript 6.x，因此本项目实施时使用 `typescript@6.0.3`。

本项目仍应保持静态前端 SPA 边界：不引入后端服务、数据库、登录态、服务端导出、远程同步或服务端 API。Framework Mode 只用于官方路由框架入口、类型生成和未来 route-level code splitting；运行模式应继续使用 `ssr: false`。

## 当前项目基线

- 当前项目是浏览器本地 Mermaid 在线编辑器。
- 当前核心栈是 Vite 5 + React 18 + TypeScript 5 + Ant Design + CodeMirror + Mermaid。
- 当前已安装 `react-router@7.9.4`，并通过 `BrowserRouter` + `useSearchParams` 管理轻量 URL 状态。
- `src/main.tsx` 是传统 Vite 入口。
- `src/App.tsx` 仍是主工作台，源码、设置、语言通过 localStorage 持久化。
- `src/hooks/useEditorSearchParams.ts` 是 URL query 状态唯一入口。

## 最新版本约束

来自 npm 包元信息：

- `react-router@8.2.0` 要求：
  - `react >=19.2.7`
  - `react-dom >=19.2.7`
  - `node >=22.22.0`
- `@react-router/dev@8.2.0` 要求：
  - `react-router ^8.2.0`
  - `vite ^7.0.0 || ^8.0.0`
  - `typescript ^5.1.0 || ^6.0.0`
  - `node >=22.22.0`
  - peer 里还列出 `@vitejs/plugin-rsc`、`react-server-dom-webpack`、`@react-router/serve`、`wrangler` 等能力包，但本项目不应默认启用 RSC、serve 或 Wrangler。
- `vite@8.1.4` 要求：
  - `node ^20.19.0 || >=22.12.0`
- `@vitejs/plugin-react@6.0.3` 要求：
  - `vite ^8.0.0`
  - `node ^20.19.0 || >=22.12.0`

当前本机 Node 是 `v25.2.1`，满足 React Router 8 的 Node 下限。其他开发、CI、部署环境也必须满足 `node >=22.22.0`，否则不要启动 React Router 8 升级。

## 推荐升级策略

不要把 React Router 8 Framework Mode 和 React 19 / Vite 8 升级混在一个大提交里。建议拆成三个阶段，每阶段都跑完整验证。

### 阶段 1：工具链前置升级

目标：先让项目在 React 19 + Vite 8 下继续以当前 Vite SPA 模式工作。

建议依赖：

```json
{
  "dependencies": {
    "react": "^19.2.7",
    "react-dom": "^19.2.7",
    "react-router": "^8.2.0"
  },
  "devDependencies": {
    "@types/react": "^19.2.17",
    "@types/react-dom": "^19.2.17",
    "@vitejs/plugin-react": "^6.0.3",
    "vite": "^8.1.4",
    "typescript": "^6.0.3"
  }
}
```

注意：

- 这一阶段仍保留 `src/main.tsx`、`BrowserRouter` 和 `vite.config.ts` 中的 `@vitejs/plugin-react`。
- 先验证 Ant Design 6、Testing Library、Vitest、jsdom、CodeMirror、Mermaid 在 React 19/Vite 8 下是否有破坏性问题。
- `vitest@4.1.10` 已支持 Vite 8，暂时可以保留；如果实际运行报 Vite API 或 transform 问题，再单独升级测试相关包。

验收：

```powershell
npm test -- --run
npm run lint
npm run build
```

### 阶段 2：切换 React Router 8 Framework Mode SPA

目标：在工具链稳定后，把入口切到 React Router Framework Mode，但继续保持静态 SPA。

新增依赖：

```json
{
  "devDependencies": {
    "@react-router/dev": "^8.2.0"
  }
}
```

`@react-router/node`、`@react-router/serve` 不应主动加入生产依赖，除非 React Router 8 的实际构建流程明确要求，且我们确认不会改变部署边界。实际实施中，React Router 8 的默认 server entry 会在 SPA build 阶段要求 `isbot@5`；显式保留 `isbot` 可以避免 `react-router build` 在构建过程中自动修改 `package.json` 并触发 npm install。

建议配置：

```ts
// react-router.config.ts
import type { Config } from "@react-router/dev/config";

export default {
  appDirectory: "src",
  ssr: false,
} satisfies Config;
```

```ts
// src/routes.ts
import { index, type RouteConfig } from "@react-router/dev/routes";

export default [index("./App.tsx")] satisfies RouteConfig;
```

```ts
// vite.config.ts
import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";

export default defineConfig(({ mode }) => ({
  plugins: mode === "test" ? [] : [reactRouter()],
  build: {
    // 保留当前 manualChunks 策略
  },
}));
```

说明：Vitest 可能不适合直接加载 React Router Framework Vite 插件。若测试出现 React Refresh preamble 或 Framework 插件启动问题，测试模式下跳过 `reactRouter()`，让组件测试继续走普通 Vite transform。

新增入口：

```ts
// src/entry.client.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { HydratedRouter } from "react-router/dom";

ReactDOM.hydrateRoot(
  document,
  <React.StrictMode>
    <HydratedRouter />
  </React.StrictMode>,
);
```

`src/root.tsx` 负责 HTML shell、`Meta`、`Links`、`Scripts`、`ScrollRestoration` 和 `Outlet`，并迁移当前 `index.html` 中的 title、description、viewport、favicon。

`src/App.tsx` 建议保留命名导出供测试使用，同时增加 default export 给 route module 使用：

```ts
export function App() {
  // current app
}

export default App;
```

脚本建议：

```json
{
  "scripts": {
    "dev": "react-router dev",
    "build": "react-router typegen && tsc -b && react-router build",
    "test": "vitest",
    "preview": "vite preview --outDir build/client",
    "lint": "eslint ."
  }
}
```

生成目录处理：

- `.gitignore` 加入 `build` 和 `.react-router`。
- `eslint.config.js` ignore 加入 `build` 和 `.react-router`。
- `tsconfig.node.json` include 加入 `react-router.config.ts`。
- `src/vite-env.d.ts` 加入 `/// <reference types="vite/client" />`，让 TypeScript 6 能识别 CSS side-effect imports。

验收：

```powershell
npm test -- --run
npm run lint
npm run build
```

构建输出必须确认：

- `ssr:false` 生效。
- 最终可作为静态 SPA 部署。
- 没有要求长期运行的 Node server。

### 阶段 3：浏览器真实冒烟

目标：确认 React Router 8 Framework Mode 没有破坏用户工作流。

必须检查：

- 默认首页可打开编辑器。
- URL query 状态仍由 `useEditorSearchParams` 正常读写。
- 刷新后 localStorage 的源码、设置、语言仍能恢复。
- 合法 Mermaid 输入能渲染。
- 非法 Mermaid 输入能显示现有诊断。
- SVG / PNG / JPG / Markdown 导出仍在浏览器本地完成。
- 桌面和 `390x844` 移动宽度无横向溢出。

## 不建议做的事

- 不启用 SSR。
- 不启用 React Server Components。
- 不引入 `@react-router/serve` 作为部署模型，除非未来明确转向服务端运行。
- 不把 Mermaid 源码、完整 settings、locale、导出结果或弹窗开关塞进 URL 或 loader/action。
- 不把 browser-local localStorage 状态改成 server state。
- 不提交 `build/`、`.react-router/`、`dist/`、`node_modules/`、runtime、临时文件或密钥。

## 主要风险

- React 19 升级风险高于 React Router 入口迁移风险，应该先单独验证。
- Vite 8 和 `@vitejs/plugin-react@6` 可能改变 transform、React Refresh、测试环境行为。
- React Router Framework Vite 插件可能影响 Vitest，因此测试模式可能需要跳过插件。
- `react-router build` 输出目录从传统 `dist/` 变为 `build/client`，部署配置和 preview 命令要同步。
- SPA Mode 构建过程可能临时生成 server bundle，但最终必须移除 server build 并生成静态 `index.html`。

## 当前建议

先不要直接实施 React Router 8 Framework Mode。正确顺序是：

1. 创建独立任务：React 19 + Vite 8 基线升级。
2. 基线通过后，再创建独立任务：React Router 8 Framework Mode SPA 迁移。
3. 每个任务都单独跑测试、lint、build 和浏览器冒烟。

## 参考来源

- React Router 官方 SPA Mode：`ssr: false` 禁用运行时 SSR 并生成 SPA `index.html`。https://reactrouter.com/how-to/spa
- React Router 官方 `react-router.config.ts`：`ssr` 可设为 `false` 以预渲染 SPA。https://reactrouter.com/api/framework-conventions/react-router.config.ts
- React Router 官方 component routes 升级文档：Framework Mode 使用 React Router Vite 插件替代普通 React 插件。https://reactrouter.com/upgrading/component-routes
- React Router 官方 routes 配置：`routes.ts` 使用 `index`、`route`、`layout` 等 helper。https://reactrouter.com/start/framework/routing
- npm package metadata：`react-router@8.2.0`、`@react-router/dev@8.2.0`、`vite@8.1.4`、`@vitejs/plugin-react@6.0.3`、`react@19.2.7`、`react-dom@19.2.7`、`typescript@6.0.3`。
