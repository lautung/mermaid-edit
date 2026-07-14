import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { basicSetup } from "codemirror";
import { indentWithTab } from "@codemirror/commands";
import { Annotation, EditorState, Transaction } from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";

type MermaidCodeEditorProps = {
  value: string;
  ariaLabel?: string;
  onChange: (value: string) => void;
};

export type MermaidCodeEditorHandle = {
  focusLine: (line: number) => void;
  insertAtCursor: (snippet: string) => void;
  insertAfterLine: (line: number, snippet: string) => void;
};

const editorTheme = EditorView.theme({
  "&": {
    height: "100%",
    backgroundColor: "#151d21",
    color: "#e9f5f3",
  },
  ".cm-scroller": {
    overflow: "auto",
    fontFamily: '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace',
    lineHeight: "1.7",
  },
  ".cm-content": {
    minHeight: "100%",
    padding: "18px 20px",
    caretColor: "#64d8cb",
  },
  ".cm-cursor": {
    borderLeftColor: "#64d8cb",
    borderLeftWidth: "2px",
  },
  ".cm-gutters": {
    border: "none",
    backgroundColor: "#151d21",
    color: "#718986",
    padding: "18px 0 18px 14px",
  },
  ".cm-activeLine": {
    backgroundColor: "rgb(255 255 255 / 4%)",
  },
  ".cm-activeLineGutter": {
    backgroundColor: "rgb(255 255 255 / 7%)",
    color: "#b9d9d4",
  },
  ".cm-selectionBackground, ::selection": {
    backgroundColor: "rgb(100 216 203 / 24%)",
  },
});

const externalUpdate = Annotation.define<boolean>();

export const MermaidCodeEditor = forwardRef<MermaidCodeEditorHandle, MermaidCodeEditorProps>(
  function MermaidCodeEditor({ value, ariaLabel = "输入 Mermaid 代码", onChange }, ref) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const initialValueRef = useRef(value);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const view = new EditorView({
      state: EditorState.create({
        doc: initialValueRef.current,
        extensions: [
          basicSetup,
          editorTheme,
          keymap.of([indentWithTab]),
          EditorView.lineWrapping,
          EditorView.contentAttributes.of({
            spellcheck: "false",
            autocorrect: "off",
            autocapitalize: "off",
          }),
          EditorView.updateListener.of((update) => {
            const isExternalUpdate = update.transactions.some((transaction) =>
              transaction.annotation(externalUpdate),
            );

            if (update.docChanged && !isExternalUpdate) {
              onChangeRef.current(update.state.doc.toString());
            }
          }),
        ],
      }),
      parent: containerRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, []);

  useEffect(() => {
    const view = viewRef.current;
    if (!view || view.state.doc.toString() === value) {
      return;
    }

    view.dispatch({
      changes: { from: 0, to: view.state.doc.length, insert: value },
      annotations: [externalUpdate.of(true), Transaction.addToHistory.of(false)],
    });
  }, [value]);

  useImperativeHandle(ref, () => ({
    focusLine(line) {
      const view = viewRef.current;
      if (!view) {
        return;
      }

      const target = getLine(view, line);
      view.dispatch({
        selection: { anchor: target.from },
        effects: EditorView.scrollIntoView(target.from, { y: "center" }),
      });
      view.focus();
    },
    insertAtCursor(snippet) {
      const view = viewRef.current;
      if (!view) {
        return;
      }

      const position = view.state.selection.main.from;
      view.dispatch({ changes: { from: position, insert: snippet } });
      view.focus();
    },
    insertAfterLine(line, snippet) {
      const view = viewRef.current;
      if (!view) {
        return;
      }

      const target = getLine(view, line);
      view.dispatch({ changes: { from: target.to, insert: `\n${snippet}` } });
      view.focus();
    },
  }));

    return <div ref={containerRef} className="codeEditor" aria-label={ariaLabel} />;
  },
);

function getLine(view: EditorView, line: number) {
  const lineNumber = Math.max(1, Math.min(line, view.state.doc.lines));
  return view.state.doc.line(lineNumber);
}
