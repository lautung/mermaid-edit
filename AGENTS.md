使用UTF-8编码。
使用中文和用户沟通。
Windows环境中，优先使用 PowerShell 7；如果兼容性有问题再使用 PowerShell 5。
web调试时，优先使用 Chrome 浏览器，其次使用 Codex 内置浏览器。

## 项目事实

- 这是一个静态前端 Mermaid 在线编辑器，不包含后端服务、数据库、登录态或服务端 API。
- 技术栈是 Vite + React + TypeScript + Ant Design + CodeMirror + Mermaid。
- Mermaid 渲染入口在 `src/hooks/useMermaidRenderer.ts`，导出逻辑在 `src/utils/exportDiagram.ts`，模板数据在 `src/data/examples.ts`。
- SVG / PNG / JPG / Markdown 导出均在浏览器本地完成；不要引入服务器端导出流程。
- PNG/JPG 导出依赖 `canvg` 直接把 SVG 渲染到 Canvas，避免走 `Image -> Canvas` 导致 tainted canvas。
- 运行、验证和构建命令以 `package.json` 为准：`npm test -- --run`、`npm run lint`、`npm run build`。
- README 截图放在 `docs/screenshots/`，应来自真实运行页面，不要使用设计稿替代。
- runtime、临时文件、密钥、`node_modules/`、`dist/` 不要提交或 push。

<!-- TRELLIS:START -->
# Trellis Instructions

These instructions are for AI assistants working in this project.

This project is managed by Trellis. The working knowledge you need lives under `.trellis/`:

- `.trellis/workflow.md` — development phases, when to create tasks, skill routing
- `.trellis/spec/` — package- and layer-scoped coding guidelines (read before writing code in a given layer)
- `.trellis/workspace/` — per-developer journals and session traces
- `.trellis/tasks/` — active and archived tasks (PRDs, research, jsonl context)

If a Trellis command is available on your platform (e.g. `/trellis:finish-work`, `/trellis:continue`), prefer it over manual steps. Not every platform exposes every command.

If you're using Codex or another agent-capable tool, additional project-scoped helpers may live in:
- `.agents/skills/` — reusable Trellis skills
- `.codex/agents/` — optional custom subagents

Managed by Trellis. Edits outside this block are preserved; edits inside may be overwritten by a future `trellis update`.

<!-- TRELLIS:END -->
