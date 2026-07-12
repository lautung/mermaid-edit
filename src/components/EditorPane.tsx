import { Alert, Tabs, Typography } from "antd";
import { CodeOutlined, ImportOutlined } from "@ant-design/icons";
import type { RenderState } from "../types";
import { MermaidCodeEditor } from "./MermaidCodeEditor";

type EditorPaneProps = {
  value: string;
  renderState: RenderState;
  onChange: (value: string) => void;
};

export function EditorPane({ value, renderState, onChange }: EditorPaneProps) {
  const lineCount = value.split("\n").length;
  const statusType = renderState.status === "error" ? "error" : "success";
  const statusMessage =
    renderState.status === "error" ? "语法检查未通过" : "语法检查通过，图表渲染正常。";

  return (
    <section className="workspacePanel editorPane" aria-label="Mermaid 代码编辑器">
      <Tabs
        className="panelTabs"
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
            disabled: true,
          },
        ]}
      />
      <MermaidCodeEditor value={value} onChange={onChange} />
      <div className="editorFooter">
        <Alert
          closable
          showIcon
          type={statusType}
          message={statusMessage}
          banner
        />
        <Typography.Text type="secondary">
          行 {lineCount}，长度 {value.length}
        </Typography.Text>
      </div>
    </section>
  );
}
