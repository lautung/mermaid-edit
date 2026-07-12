# 执行计划：Mermaid 编辑器架构评审

## 顺序清单

1. [ ] 重新确认任务上下文、Git 状态和任务目录状态。
2. [ ] 阅读前端 spec、产品文档、测试以及 `src/` 关键文件。
3. [ ] 建立状态流、渲染流、导出流和持久化流的证据表。
4. [ ] 对候选应用 deletion test，并按 depth、seam、leverage、locality 和测试面筛选。
5. [ ] 编写系统临时目录中的自包含 HTML 报告。
6. [ ] 检查 HTML 是否包含所有候选卡片、图示、Top recommendation 和绝对路径。
7. [ ] 使用 Windows 默认程序打开报告；若系统无法打开，至少验证文件存在且 HTML 结构完整。

## 候选 01 实现草案（待设计确认）

1. [x] 通过 hook 公开结果补充渲染协调的回归测试：旧成功结果晚返回、旧错误晚返回、最新输入为空。
2. [x] 让每次 source/settings 变化都使此前请求失效，空输入也不能绕过失效标记。
3. [x] 只允许当前请求提交 `RenderState` 和 SVG，保留现有渲染中与导出行为。
4. [x] 运行渲染相关测试、全量测试、lint 和 build。

## 验证命令

```powershell
git status --short
rg --files src docs .trellis/spec
npm run lint
npm run build
```

本任务不修改源码，因此 `npm run lint` 和 `npm run build` 用于确认评审过程没有引入代码变化；若基线命令失败，记录为基线状态，不在本任务中修复业务代码。

## 风险与回滚点

- 主要风险是把未来设计文档当成当前实现；通过逐文件读取源码和测试规避。
- 主要风险是候选过度抽象；通过 deletion test 和 adapter 数量规则筛选。
- 报告只写入 `%TEMP%`，删除该临时文件即可回滚输出，不影响仓库。
- 若发现源码必须修改才能完成评审，应停止并回到规划阶段，不在本任务中直接实现重构。
