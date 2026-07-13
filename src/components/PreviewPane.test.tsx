// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { PreviewPane } from "./PreviewPane";

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

vi.stubGlobal("ResizeObserver", ResizeObserverStub);

describe("PreviewPane", () => {
  afterEach(() => {
    cleanup();
  });

  test("uses layout-aware zoom so enlarged diagrams keep a scrollable layout area", () => {
    const { container } = render(
      <PreviewPane
        svg="<svg viewBox='0 0 1200 300'><rect width='1200' height='300' /></svg>"
        state={{ status: "ready", message: "渲染完成" }}
        zoom={200}
        scale={2}
        filename="diagram"
        background="transparent"
        activeTab="preview"
        onActiveTabChange={vi.fn()}
      />,
    );

    const surface = container.querySelector<HTMLElement>(".svgSurface");
    expect(surface).not.toBeNull();
    expect(surface?.style.zoom).toBe("200%");
    expect(surface?.style.getPropertyValue("--preview-width")).toBe("1040px");
    expect(surface?.style.getPropertyValue("--preview-height")).toBe("260px");
    expect(surface?.style.transform).toBe("");
  });

  test("normalizes unusually wide and tall template previews without distorting their aspect ratio", () => {
    const { container, rerender } = render(
      <PreviewPane
        svg="<svg viewBox='0 0 1026 62'><rect width='1026' height='62' /></svg>"
        state={{ status: "ready", message: "渲染完成" }}
        zoom={100}
        scale={2}
        filename="diagram"
        background="transparent"
        activeTab="preview"
        onActiveTabChange={vi.fn()}
      />,
    );

    const surface = container.querySelector<HTMLElement>(".svgSurface");
    expect(surface?.style.getPropertyValue("--preview-width")).toBe("1800px");
    expect(surface?.style.getPropertyValue("--preview-height")).toBe("109px");

    rerender(
      <PreviewPane
        svg="<svg viewBox='0 0 158.125 787.75'><rect width='158.125' height='787.75' /></svg>"
        state={{ status: "ready", message: "渲染完成" }}
        zoom={100}
        scale={2}
        filename="diagram"
        background="transparent"
        activeTab="preview"
        onActiveTabChange={vi.fn()}
      />,
    );

    expect(surface?.style.getPropertyValue("--preview-width")).toBe("112px");
    expect(surface?.style.getPropertyValue("--preview-height")).toBe("560px");
  });

  test("shows syntax details and repair guidance on the error tab", () => {
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
        activeTab="error"
        onActiveTabChange={vi.fn()}
      />,
    );

    expect(screen.getByText("请在左侧编辑器中定位并修复语法错误。")).not.toBeNull();
    expect(screen.getByText("流程图：流程连线需要完整的目标节点。")).not.toBeNull();
    expect(screen.getByText("请手动修改高亮错误行；安全片段仅供参照，不会替换已有代码。")).not.toBeNull();
  });

  test("renders real export check tab content without preview metadata in the preview tab", () => {
    const { rerender } = render(
      <PreviewPane
        svg="<svg viewBox='0 0 120 80'><rect width='120' height='80' /></svg>"
        state={{ status: "ready", message: "渲染完成" }}
        zoom={100}
        scale={2}
        filename="diagram"
        background="transparent"
        activeTab="preview"
        onActiveTabChange={vi.fn()}
      />,
    );

    expect(screen.queryByText("可导出")).toBeNull();
    expect(screen.queryByText("文件名：diagram")).toBeNull();

    rerender(
      <PreviewPane
        svg="<svg viewBox='0 0 120 80'><rect width='120' height='80' /></svg>"
        state={{ status: "ready", message: "渲染完成" }}
        zoom={100}
        scale={2}
        filename="diagram"
        background="transparent"
        activeTab="export"
        onActiveTabChange={vi.fn()}
      />,
    );

    expect(screen.getByText("已满足导出条件")).not.toBeNull();
    expect(screen.getByText("图表已渲染完成")).not.toBeNull();
    expect(screen.getByText("已生成 SVG 内容")).not.toBeNull();
    expect(screen.getByText("文件名：diagram")).not.toBeNull();
    expect(screen.getByText("导出倍率：2x")).not.toBeNull();
  });

  test("reports controlled preview tab changes", () => {
    const onActiveTabChange = vi.fn();

    render(
      <PreviewPane
        svg="<svg viewBox='0 0 120 80'><rect width='120' height='80' /></svg>"
        state={{ status: "ready", message: "渲染完成" }}
        zoom={100}
        scale={2}
        filename="diagram"
        background="transparent"
        activeTab="preview"
        onActiveTabChange={onActiveTabChange}
      />,
    );

    fireEvent.click(screen.getByRole("tab", { name: /导出检查/ }));

    expect(onActiveTabChange).toHaveBeenCalledWith("export");
  });
});
