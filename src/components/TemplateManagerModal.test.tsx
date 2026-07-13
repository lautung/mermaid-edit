// @vitest-environment jsdom

import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { ConfigProvider } from "antd";
import type { ComponentProps } from "react";
import { describe, expect, test, vi } from "vitest";
import { TemplateManagerModal } from "./TemplateManagerModal";
import type { DiagramTemplate } from "../data/examples";

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

const templates: DiagramTemplate[] = [
  {
    id: "flow-basic",
    title: "流程图 - 基础决策",
    typeKey: "flowchart",
    type: "流程图",
    tags: ["常用", "技术文档"],
    source: "flowchart TD\n  A --> B",
  },
  {
    id: "sequence-login",
    title: "时序图 - 用户登录",
    typeKey: "sequence",
    type: "时序图",
    tags: ["产品流程"],
    source: "sequenceDiagram\n  A->>B: login",
  },
];

function renderModal(overrides: Partial<ComponentProps<typeof TemplateManagerModal>> = {}) {
  const props = {
    open: true,
    templates,
    chartTypes: ["flowchart", "sequence"],
    onClose: vi.fn(),
    onSelectTemplate: vi.fn(),
    ...overrides,
  };

  render(
    <ConfigProvider>
      <TemplateManagerModal {...props} />
    </ConfigProvider>,
  );

  return props;
}

describe("TemplateManagerModal", () => {
  test("filters templates and loads the selected template", async () => {
    const props = renderModal();

    fireEvent.change(screen.getByRole("textbox", { name: "搜索模板" }), {
      target: { value: "登录" },
    });

    expect(screen.getByText("时序图 - 用户登录")).not.toBeNull();
    expect(screen.queryByText("流程图 - 基础决策")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: /载\s*入/ }));

    expect(props.onSelectTemplate).toHaveBeenCalledWith("sequence-login");
    expect(props.onClose).toHaveBeenCalled();
  });

  test("marks the active template without disabling template loading", async () => {
    renderModal({ activeTemplateId: "flow-basic" });

    const activeItem = screen.getByText("流程图 - 基础决策").closest(".templateManagerItem");

    expect(activeItem).not.toBeNull();
    await waitFor(() => {
      expect(within(activeItem as HTMLElement).getByRole("button", { name: "当前模板" })).not.toBeNull();
    });
  });
});
