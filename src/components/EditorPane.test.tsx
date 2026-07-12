// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { EditorPane } from "./EditorPane";

vi.mock("./MermaidCodeEditor", async () => {
  const React = await import("react");

  return {
    MermaidCodeEditor: React.forwardRef(function MermaidCodeEditorStub(_, ref) {
      React.useImperativeHandle(ref, () => ({
        focusLine: vi.fn(),
        insertAtCursor: vi.fn(),
        insertAfterLine: vi.fn(),
      }));
      return <div aria-label="输入 Mermaid 代码" />;
    }),
  };
});

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

vi.stubGlobal("ResizeObserver", ResizeObserverStub);

describe("EditorPane", () => {
  test("shows the syntax assistant for a structured render error", () => {
    render(
      <EditorPane
        value="flowchart TD\n  start[开始] -->"
        renderState={{
          status: "error",
          message: "Parse error on line 2",
          diagnostic: {
            line: 2,
            summary: "流程图：流程连线需要完整的目标节点。",
            manualFixHint: "请手动修改高亮错误行；安全片段仅供参照，不会替换已有代码。",
            rawMessage: "Parse error on line 2",
            rule: {
              id: "flowchart.connection",
              title: "补全流程连线",
              snippet: "new_node[新节点]",
            },
          },
        }}
        onChange={vi.fn()}
        onOpenMarkdownImport={vi.fn()}
      />,
    );

    expect(screen.getByRole("region", { name: "Mermaid 语法修复助手" })).not.toBeNull();
  });
});
