# 升级项目与全局 Trellis skills

## 目标

将当前项目使用的 Trellis CLI、项目级 Trellis 核心文件与 Codex/跨平台 skills 同步到官网当前稳定版本，保留项目已有的自定义规范、任务记录和用户配置，并完成升级后的可用性验证。

## 已确认事实

- 当前仓库为 `C:\Users\admin\Documents\mermaid-edit`，工作树在任务创建前是干净的。
- 项目 Trellis 版本为 `0.6.5`（`.trellis/.version`）。
- 全局 CLI 为 `@mindfoldhq/trellis@0.6.5`，命令为 `C:\Users\admin\AppData\Roaming\npm\trellis.ps1`。
- 官网当前 npm 最新版本查询结果为 `@mindfoldhq/trellis@0.6.6`。
- 项目已有 `.agents/skills/trellis-*` 共 12 个技能目录；当前根目录未发现 `.codex/` 平台目录。
- 官方升级文档将升级拆成两步：`trellis upgrade` 升级全局 CLI，`trellis update` 在项目内同步 `.trellis/` 与平台文件；如果提示迁移，再使用 `trellis update --migrate`。
- 官方文档说明 Codex 项目配置位于 `.codex/`，同时 Trellis 会写入共享层 `.agents/skills/`。

## 需求

### R1：升级全局 Trellis CLI

使用官方支持的升级路径，将全局 `@mindfoldhq/trellis` 升级到官网当前版本，并记录升级前后版本。

### R2：同步项目 Trellis 与 skills

在本项目执行官方项目同步流程，使 `.trellis/`、`.agents/skills/` 以及适用的 Codex 项目文件与新 CLI 版本一致。保留项目已有的非生成内容、spec、tasks、workspace 和用户配置；对生成文件的变更进行审查。

### R3：验证与风险控制

- 升级前保存 Git 状态、版本和受影响文件清单。
- 若官方命令报告需要迁移，按官方文档执行迁移并审查路径/内容变化。
- 运行 Trellis 上下文检查、任务校验及与本项目相关的最小构建/检查命令。
- 不提交 runtime、临时文件、密钥或与本次升级无关的用户改动。
- 若升级失败，保留可识别的失败原因和恢复方式，不覆盖项目业务代码。

## 验收标准

- [x] 全局 `trellis --version` 与官方目标版本一致。
- [x] 项目 `.trellis/.version` 与 CLI 目标版本一致。
- [x] 项目级 Trellis skills 已由官方同步流程更新，且无意外删除项目自定义内容。
- [x] Codex 适用的项目配置/skills 已按官方布局生成或更新；官方流程不生成额外全局用户级 skill，边界已记录。
- [x] `python ./.trellis/scripts/get_context.py`、`task.py validate` 和必要的项目检查通过。
- [x] Git diff 仅包含本次升级及本 Trellis 任务需要的文件。

## 范围外

- 不安装第三方或社区 marketplace skills。
- 不修改项目业务功能、依赖或部署配置。
- 不把个人全局 skill 目录伪装成 Trellis 官方支持的安装目标；若需要额外全局 skill，另行确认其官方来源和安装方式。

## 已确定决策

- 采用官网推荐的 `trellis upgrade` + 项目内 `trellis update` 作为升级路径。
- 仅在官方命令明确报告需要迁移时使用 `trellis update --migrate`。
- “全局升级”定义为全局 `@mindfoldhq/trellis` CLI 升级；不额外创建非官方的用户级 Trellis skills 目录。
