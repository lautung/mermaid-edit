# 执行计划：Trellis CLI 与项目 skills 升级

## 1. 升级前快照

- [x] 确认任务状态为 planning 且工作树状态，记录 `git status --short`。
- [x] 记录 `trellis --version`、`npm list -g @mindfoldhq/trellis --depth=0`、`.trellis/.version`。
- [x] 记录 `.trellis/`、`.agents/skills/`、`.codex/` 当前文件清单和模板哈希文件状态。

## 2. 激活任务并升级全局 CLI

- [x] 运行 `python ./.trellis/scripts/task.py start .trellis/tasks/07-12-upgrade-trellis-skills`。
- [x] 运行 `trellis upgrade`。
- [x] 运行 `trellis --version` 和 `npm list -g @mindfoldhq/trellis --depth=0`，确认升级结果。

## 3. 同步项目文件

- [x] 在仓库根目录运行 `trellis update`。
- [x] 官方命令未提示 `MIGRATION REQUIRED`；未执行不必要的 `--migrate`。
- [x] 查看 `git status --short` 和 `git diff --stat`，确认变更集中在 Trellis 生成文件及本任务文件。
- [x] 检查 `.trellis/.version` 与全局 CLI 版本一致。

## 4. 质量验证

- [x] 运行 `python ./.trellis/scripts/get_context.py`。
- [x] 运行 `python ./.trellis/scripts/task.py validate .trellis/tasks/07-12-upgrade-trellis-skills`。
- [x] 运行 `git diff --check`。
- [x] 检查变更文件中不包含 runtime、临时文件、密钥或业务代码意外修改。
- [x] 按项目现有脚本执行 frontend lint、build 和测试。

## 5. 收尾门槛

- [x] 运行最终全范围 Trellis 检查，审查项目 spec 与生成文件兼容性。
- [x] 按 `trellis-update-spec` 判断：本次为官方生成文件升级，没有新增项目业务契约或编码约定，无需更新 `.trellis/spec/`。
- [ ] 仅在验收标准全部满足后提交本次变更，并使用 Trellis finish 流程归档任务。

## 风险点与停止条件

- `trellis upgrade` 无法访问 npm 或版本安装失败：停止项目同步，保留原项目状态并报告。
- `trellis update` 需要迁移但迁移范围不明确：停止，不手工猜测文件移动。
- diff 涉及业务源码、密钥、runtime 或大量自定义 spec：停止审查，不直接提交。
