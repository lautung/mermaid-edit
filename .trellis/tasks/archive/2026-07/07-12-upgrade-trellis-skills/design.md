# 技术设计：Trellis CLI 与项目生成文件升级

## 边界

本任务分为两个同步边界：

1. 全局边界：通过官方 CLI 的 `trellis upgrade` 更新 `@mindfoldhq/trellis`。
2. 项目边界：在 `mermaid-edit` 根目录通过 `trellis update` 同步 `.trellis/`、`.agents/skills/` 及官方支持的 Codex 项目文件。

项目已有的 `.trellis/spec/`、任务目录、workspace、业务源代码和非生成配置默认视为用户内容，不主动重建或删除。

## 数据流

```text
官方 npm 最新版本
        |
        v
全局 @mindfoldhq/trellis CLI --upgrade
        |
        v
项目内 trellis update
        |
        +--> .trellis/ 核心模板与版本
        +--> .agents/skills/ 共享 skills
        +--> .codex/ 适用的 Codex 项目文件
```

## 兼容性与迁移

- 升级前记录 CLI 版本、`.trellis/.version`、Git 状态和生成文件清单。
- `trellis update` 若仅报告普通模板更新，审查 diff 后保留官方更新。
- 若报告 `MIGRATION REQUIRED`，先停止继续操作，读取命令提示；确认迁移范围后执行 `trellis update --migrate`，重点检查文件移动、工作流状态注入和平台目录。
- 不使用 `trellis init --force` 替代更新，避免重新初始化开发者身份、任务或项目规范。

## 自定义内容保护

- 对 `.trellis/spec/`、`.trellis/tasks/`、`.trellis/workspace/` 和 `AGENTS.md` 的变更逐项审查。
- 只保留由官方更新命令产生且与升级相关的生成文件变化。
- 若模板更新覆盖项目自定义内容，优先停止并根据 `.trellis/.template-hashes.json` 与 Git diff 恢复/合并，不直接覆盖用户内容。

## 回滚

- 全局 CLI：使用 npm 安装前记录的版本执行 `npm install -g @mindfoldhq/trellis@<旧版本>`。
- 项目文件：不使用破坏性 Git 回退；根据升级前清单和工作树 diff，逐项恢复本次生成变更，保留用户在任务期间产生的无关改动。
- 若迁移造成不可逆文件布局变化，先保留命令输出与 diff，再停止并报告，不继续修改业务文件。

## 完成定义

全局 CLI 与项目 `.trellis/.version` 一致，官方生成 skills/平台文件已同步，Trellis 上下文与任务校验通过，且最终 diff 不含 runtime、临时文件、密钥和无关业务变更。
