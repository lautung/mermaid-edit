// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { SyntaxAssistant } from "./SyntaxAssistant";

const diagnostic = {
  line: 2,
  summary: "流程图：流程连线需要完整的目标节点。",
  manualFixHint: "请手动修改高亮错误行；安全片段仅供参照，不会替换已有代码。",
  rawMessage: "Parse error on line 2",
  rule: {
    id: "flowchart.connection",
    title: "补全流程连线",
    snippet: "new_node[新节点]",
  },
};

describe("SyntaxAssistant", () => {
  test("exposes focused, append-only repair actions", () => {
    const onFocusLine = vi.fn();
    const onInsertAtCursor = vi.fn();
    const onInsertAfterLine = vi.fn();
    const onCopyRawMessage = vi.fn();

    render(
      <SyntaxAssistant
        diagnostic={diagnostic}
        onFocusLine={onFocusLine}
        onInsertAtCursor={onInsertAtCursor}
        onInsertAfterLine={onInsertAfterLine}
        onCopyRawMessage={onCopyRawMessage}
      />,
    );

    expect(screen.getByText("第 2 行")).not.toBeNull();
    expect(screen.getByText(diagnostic.summary)).not.toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "定位错误" }));
    fireEvent.click(screen.getByRole("button", { name: "插入到错误行后" }));
    fireEvent.click(screen.getByRole("button", { name: "插入到光标处" }));
    fireEvent.click(screen.getByRole("button", { name: "复制技术详情" }));

    expect(onFocusLine).toHaveBeenCalledWith(2);
    expect(onInsertAfterLine).toHaveBeenCalledWith(2, diagnostic.rule.snippet);
    expect(onInsertAtCursor).toHaveBeenCalledWith(diagnostic.rule.snippet);
    expect(onCopyRawMessage).toHaveBeenCalledWith(diagnostic.rawMessage);
  });
});
