import { describe, expect, it } from "vitest";
import { extractMermaidBlocks, formatMermaidMarkdown } from "./markdownMermaid";

describe("markdownMermaid", () => {
  it("extracts one or more mermaid fenced blocks", () => {
    const blocks = extractMermaidBlocks(`
      # Docs
      \`\`\`mermaid
      flowchart LR
        A --> B
      \`\`\`
      \`\`\`javascript
      console.log("ignored")
      \`\`\`
      \`\`\`MERMAID
      sequenceDiagram
        A->>B: hello
      \`\`\`
    `);

    expect(blocks).toEqual([
      { index: 1, source: "flowchart LR\n        A --> B" },
      { index: 2, source: "sequenceDiagram\n        A->>B: hello" },
    ]);
  });

  it("formats source as a round-trip mermaid markdown block", () => {
    expect(formatMermaidMarkdown("\nflowchart LR\n  A --> B\n")).toBe(
      "```mermaid\nflowchart LR\n  A --> B\n```\n",
    );
  });

  it("ignores empty mermaid blocks", () => {
    expect(extractMermaidBlocks("```mermaid\n```\n")).toEqual([]);
  });
});
