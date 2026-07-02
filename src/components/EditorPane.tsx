type EditorPaneProps = {
  value: string;
  onChange: (value: string) => void;
};

export function EditorPane({ value, onChange }: EditorPaneProps) {
  return (
    <section className="pane editorPane" aria-label="Mermaid 代码编辑器">
      <div className="paneHeader">
        <div>
          <h2>代码</h2>
          <span>{value.split("\n").length} 行</span>
        </div>
        <code>Mermaid</code>
      </div>
      <textarea
        value={value}
        spellCheck={false}
        onChange={(event) => onChange(event.target.value)}
        aria-label="输入 Mermaid 代码"
      />
    </section>
  );
}
