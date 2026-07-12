# 架构评审：寻找 Mermaid 编辑器的深模块机会

## Goal

基于当前 checkout 的真实代码和既有产品文档，识别 Mermaid 编辑器中值得深化的 module，说明它们的 interface、seam、depth、leverage、locality 与测试影响，并生成一份可浏览的临时 HTML 架构评审报告。

本任务只做架构评审和候选方案整理，不实现候选重构。

## Background

- 项目是单仓库 Vite + React + TypeScript 静态前端。
- 当前代码集中在 `src/components`、`src/hooks`、`src/data`、`src/utils` 与 `src/types.ts`。
- 既有产品文档确认核心流程为 Mermaid 源码编辑、实时预览、错误状态、主题/缩放、SVG/PNG/JPG 导出、复制 SVG 和本地保存。
- 仓库未发现 `CONTEXT.md` 或 `docs/adr/`；本次评审以 `docs/prd-mermaid-online-editor.md`、`docs/design-ant-design-mermaid-editor.md`、`.trellis/spec/frontend/` 及实现代码为上下文。

## Requirements

1. 直接检查当前 checkout，不依据旧版本结构推断架构。
2. 先检查项目文档、前端规范、测试和关键源码，再提出候选。
3. 使用 `module`、`interface`、`implementation`、`depth`、`shallow`、`seam`、`adapter`、`leverage`、`locality` 术语描述问题和收益。
4. 对每个候选执行 deletion test，避免把纯粹的 pass-through module 当作深化机会。
5. 每个候选说明涉及文件、问题、方案、收益、测试面和推荐强度，并提供 before/after 结构图。
6. 报告必须是自包含 HTML，写入系统临时目录，不新增仓库内临时报告或运行时文件。
7. 报告生成后打开或尝试打开该文件，并把绝对路径告知用户。

## Constraints

- 不修改业务源码、配置、依赖或产品文档。
- 不提出尚未被代码或产品上下文支撑的具体接口实现作为既定方案；报告只呈现可供选择的深化方向。
- 保留当前工作树中与本任务无关的文件状态。
- 使用 UTF-8 编码。

## Selected Direction

- 用户已选择候选 01，并确认本次只处理“最后一次输入对应的渲染结果必须赢”的竞态。
- 主题、布局、Frontmatter、导出和现有界面表现不在本次实现范围内。
- 计划保留当前渲染中显示旧图、最新输入完成后更新预览的体验；具体空输入和过期错误的行为在设计确认中锁定。
- 用户已确认：清空代码也算最新输入，旧图不能在空输入状态下重新出现。

## Acceptance Criteria

- [ ] 已检查当前 Git 状态、项目结构、前端规范、产品文档、测试和关键源码。
- [ ] 已记录 `CONTEXT.md` 与 ADR 的发现结果；不存在时明确说明评审使用的替代上下文。
- [ ] 报告至少包含 3 个由代码证据支持的架构候选，每个候选有 Strong、Worth exploring 或 Speculative 推荐强度。
- [ ] 每个候选都有文件列表、问题、方案、leverage/locality/测试收益和 before/after 可视化。
- [ ] 报告包含 Top recommendation，并解释优先级依据。
- [ ] HTML 报告位于系统临时目录，且未写入仓库工作树。
- [ ] 已对报告文件执行可读性/结构检查，并成功打开或尝试用 Windows 默认程序打开。
- [x] 快速连续输入时，旧请求的 ready/error 结果不能覆盖最新输入的状态。
- [x] 最新输入为空时，任何在途渲染都不能让旧图表重新出现。
