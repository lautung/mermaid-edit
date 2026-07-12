import { Alert, Tabs, Typography } from "antd";
import { CodeOutlined, ImportOutlined } from "@ant-design/icons";
import { useRef } from "react";
import type { RenderState } from "../types";
import { MermaidCodeEditor } from "./MermaidCodeEditor";
import type { MermaidCodeEditorHandle } from "./MermaidCodeEditor";
import { SyntaxAssistant } from "./SyntaxAssistant";

type EditorPaneProps = {
  value: string;
  renderState: RenderState;
  onChange: (value: string) => void;
  onOpenMarkdownImport: () => void;
};

export function EditorPane({ value, renderState, onChange, onOpenMarkdownImport }: EditorPaneProps) {
  const editorRef = useRef<MermaidCodeEditorHandle>(null);
  const lineCount = value.split("\n").length;
  const diagnostic = renderState.status === "error" ? renderState.diagnostic : undefined;
  const statusType = renderState.status === "error" ? "error" : "success";
  const statusMessage =
    renderState.status === "error" ? "语法检查未通过" : "语法检查通过，图表渲染正常。";

  return (
    <section className="workspacePanel editorPane" aria-label="Mermaid 代码编辑器">
      <Tabs
        className="panelTabs"
        activeKey="code"
        onTabClick={(key) => {
          if (key === "markdown") {
            onOpenMarkdownImport();
          }
        }}
        items={[
          {
            key: "code",
            label: (
              <span>
                <CodeOutlined /> 代码
              </span>
            ),
            children: null,
          },
          {
            key: "markdown",
            label: (
              <span>
                <ImportOutlined /> Markdown 导入
              </span>
            ),
            children: null,
          },
        ]}
      />
      <MermaidCodeEditor ref={editorRef} value={value} onChange={onChange} />
      <div className={diagnostic ? "editorFooter editorFooterWithAssistant" : "editorFooter"}>
        {diagnostic ? (
          <SyntaxAssistant
            diagnostic={diagnostic}
            onFocusLine={(line) => editorRef.current?.focusLine(line)}
            onInsertAtCursor={(snippet) => editorRef.current?.insertAtCursor(snippet)}
            onInsertAfterLine={(line, snippet) => editorRef.current?.insertAfterLine(line, snippet)}
            onCopyRawMessage={(message) => {
              void navigator.clipboard?.writeText(message);
            }}
          />
        ) : (
          <Alert showIcon type={statusType} title={statusMessage} banner />
        )}
        <Typography.Text type="secondary">
          行 {lineCount}，长度 {value.length}
        </Typography.Text>
      </div>
    </section>
  );
}
