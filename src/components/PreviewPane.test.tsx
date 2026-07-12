// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { PreviewPane } from "./PreviewPane";

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

vi.stubGlobal("ResizeObserver", ResizeObserverStub);

describe("PreviewPane", () => {
  test("keeps syntax repair guidance in the editor instead of duplicating raw errors", () => {
    render(
      <PreviewPane
        svg=""
        state={{
          status: "error",
          message: "Parse error on line 2",
          diagnostic: {
            summary: "流程图：流程连线需要完整的目标节点。",
            manualFixHint: "请手动修改高亮错误行；安全片段仅供参照，不会替换已有代码。",
            rawMessage: "Parse error on line 2",
          },
        }}
        zoom={100}
        scale={2}
        filename="diagram"
        background="transparent"
      />,
    );

    expect(screen.getByText("请在左侧编辑器中定位并修复语法错误。")).not.toBeNull();
    expect(screen.queryByText("Parse error on line 2")).toBeNull();
  });
});
