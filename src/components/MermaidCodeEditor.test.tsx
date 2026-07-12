// @vitest-environment jsdom

import { act, cleanup, render } from "@testing-library/react";
import { createRef } from "react";
import { EditorView } from "@codemirror/view";
import { afterEach, describe, expect, test, vi } from "vitest";
import { MermaidCodeEditor } from "./MermaidCodeEditor";
import type { MermaidCodeEditorHandle } from "./MermaidCodeEditor";

afterEach(() => cleanup());

describe("MermaidCodeEditor", () => {
  test("renders the controlled source in a CodeMirror document", () => {
    const source = "flowchart LR\n  A --> B";
    const { container } = render(<MermaidCodeEditor value={source} onChange={vi.fn()} />);
    const view = EditorView.findFromDOM(container.querySelector(".cm-editor") as HTMLElement);

    expect(container.querySelector(".cm-editor")).not.toBeNull();
    expect(view?.state.doc.toString()).toBe(source);
    expect(container.querySelector(".cm-content")?.getAttribute("spellcheck")).toBe("false");
  });

  test("reports real document changes through onChange", () => {
    const source = "flowchart LR\n  A --> B";
    const nextSource = "flowchart TD\n  A --> C";
    const onChange = vi.fn();
    const { container } = render(<MermaidCodeEditor value={source} onChange={onChange} />);
    const view = EditorView.findFromDOM(container.querySelector(".cm-editor") as HTMLElement);

    expect(view).not.toBeNull();
    act(() => {
      view?.dispatch({
        changes: { from: 0, to: view.state.doc.length, insert: nextSource },
      });
    });

    expect(onChange).toHaveBeenLastCalledWith(nextSource);
  });

  test("synchronizes an externally changed source without emitting a new change", () => {
    const source = "flowchart LR\n  A --> B";
    const nextSource = "sequenceDiagram\n  Alice->>Bob: Hello";
    const onChange = vi.fn();
    const { container, rerender } = render(
      <MermaidCodeEditor value={source} onChange={onChange} />,
    );

    rerender(<MermaidCodeEditor value={nextSource} onChange={onChange} />);

    const view = EditorView.findFromDOM(container.querySelector(".cm-editor") as HTMLElement);
    expect(view?.state.doc.toString()).toBe(nextSource);
    expect(onChange).not.toHaveBeenCalled();
  });

  test("appends a repair snippet after the requested line without replacing source", () => {
    const source = "flowchart TD\n  start[开始] -->";
    const onChange = vi.fn();
    const ref = createRef<MermaidCodeEditorHandle>();

    render(<MermaidCodeEditor ref={ref} value={source} onChange={onChange} />);

    act(() => {
      ref.current?.insertAfterLine(1, "new_node[新节点]");
    });

    expect(onChange).toHaveBeenLastCalledWith(
      "flowchart TD\nnew_node[新节点]\n  start[开始] -->",
    );
  });

  test("inserts a repair snippet at the cursor without replacing source", () => {
    const source = "flowchart TD";
    const onChange = vi.fn();
    const ref = createRef<MermaidCodeEditorHandle>();

    render(<MermaidCodeEditor ref={ref} value={source} onChange={onChange} />);

    act(() => {
      ref.current?.insertAtCursor("new_node[新节点]\n");
    });

    expect(onChange).toHaveBeenLastCalledWith("new_node[新节点]\nflowchart TD");
  });

  test("focuses the requested 1-based error line without changing source", () => {
    const source = "flowchart TD\n  start[开始] -->\n  end[结束]";
    const onChange = vi.fn();
    const ref = createRef<MermaidCodeEditorHandle>();
    const { container } = render(<MermaidCodeEditor ref={ref} value={source} onChange={onChange} />);
    const view = EditorView.findFromDOM(container.querySelector(".cm-editor") as HTMLElement);

    act(() => {
      ref.current?.focusLine(2);
    });

    expect(view?.state.selection.main.head).toBe(source.indexOf("  start"));
    expect(view?.hasFocus).toBe(true);
    expect(onChange).not.toHaveBeenCalled();
  });
});
