# CodeMirror 6 编辑器升级实施计划

1. 增加 CodeMirror 6、React 测试和 jsdom 所需依赖与测试脚本。
2. 先创建 `MermaidCodeEditor` 的失败测试，覆盖初始文档、用户修改回调和外部值同步。
3. 运行目标测试，确认测试因组件尚未实现而失败。
4. 实现 CodeMirror 受控组件，包含编辑器初始化、更新同步、基础扩展和卸载清理。
5. 将 `EditorPane` 的 textarea 替换为新组件，保持现有统计信息和状态提示。
6. 运行目标测试并修复失败项。
7. 运行完整 lint、类型检查和生产构建。
8. 启动开发服务器进行桌面和移动端浏览器检查，确认 Mermaid 预览与导出入口仍可用。

验证命令：

```powershell
npm test -- --run
npm run lint
npm run build
```
