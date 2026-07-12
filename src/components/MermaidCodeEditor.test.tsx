// @vitest-environment jsdom

import { act, cleanup, render } from "@testing-library/react";
import { EditorView } from "@codemirror/view";
import { afterEach, describe, expect, test, vi } from "vitest";
import { MermaidCodeEditor } from "./MermaidCodeEditor";

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
});
