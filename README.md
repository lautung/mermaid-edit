# Mermaid 在线编辑器

一个基于官方 Mermaid 渲染库的浏览器本地 Mermaid 在线编辑器。支持实时预览、14 种常用图表模板、主题与布局配置，以及 Markdown 导入导出。

## 已支持能力

- 官方 Mermaid API 实时渲染，保留自由输入能力。
- 模板库覆盖现有基础图表和 14 种新增常用图表：饼图、象限图、需求图、思维导图、时间线、Sankey、XY 图、块图、数据包图、看板、架构图、雷达图、树状图和韦恩图。
- 设置面板支持主题、预览背景、字体、Dagre/ELK 布局、连线曲线、导出倍率和文件名；设置会保存到浏览器 localStorage。
- 支持从粘贴文本或本地 `.md` 文件中提取多个 Mermaid fenced code block，并选择要载入的代码块。
- 支持导出 SVG、PNG、JPG 和 Markdown；PNG/JPG 导出会复用预览背景设置。
- 源码 Frontmatter 配置优先于面板设置，界面会提示被覆盖的字段。

所有编辑、渲染和导出均在浏览器本地完成，不依赖后端服务或云端存储。

## 本地运行

```bash
npm install
npm run dev
```

## 构建

```bash
npm run build
```

Vercel 会使用 `npm run build` 构建，并部署 `dist` 目录。
