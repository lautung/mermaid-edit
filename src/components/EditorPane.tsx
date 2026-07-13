import { Alert, Tabs, Typography } from "antd";
import { CodeOutlined, ImportOutlined } from "@ant-design/icons";
import { useRef } from "react";
import { useI18n } from "../i18n/useI18n";
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
  const { messages } = useI18n();
  const editorRef = useRef<MermaidCodeEditorHandle>(null);
  const lineCount = value.split("\n").length;
  const diagnostic = renderState.status === "error" ? renderState.diagnostic : undefined;
  const statusType = renderState.status === "error" ? "error" : "success";
  const statusMessage =
    renderState.status === "error" ? messages.editor.syntaxFailed : messages.editor.syntaxPassed;

  return (
    <section className="workspacePanel editorPane" aria-label={messages.editor.ariaLabel}>
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
                <CodeOutlined /> {messages.editor.codeTab}
              </span>
            ),
            children: null,
          },
          {
            key: "markdown",
            label: (
              <span>
                <ImportOutlined /> {messages.editor.markdownTab}
              </span>
            ),
            children: null,
          },
        ]}
      />
      <MermaidCodeEditor
        ref={editorRef}
        value={value}
        ariaLabel={messages.editor.codeEditorAriaLabel}
        onChange={onChange}
      />
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
          {messages.editor.lineLength(lineCount, value.length)}
        </Typography.Text>
      </div>
    </section>
  );
}
