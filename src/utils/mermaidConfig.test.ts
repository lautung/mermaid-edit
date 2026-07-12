import { describe, expect, it } from "vitest";
import { getFrontmatterOverrides } from "./mermaidConfig";

describe("getFrontmatterOverrides", () => {
  it("finds panel fields overridden by Mermaid frontmatter", () => {
    expect(
      getFrontmatterOverrides(`---
config:
  theme: dark
  themeVariables:
    background: "#101820"
  layout: elk
  flowchart:
    curve: linear
---
flowchart LR
  A --> B`),
    ).toEqual({
      hasFrontmatter: true,
      overriddenKeys: ["theme", "background", "layout", "curve"],
    });
  });

  it("does not report ordinary Mermaid source as overridden", () => {
    expect(getFrontmatterOverrides("flowchart LR\n  A --> B")).toEqual({
      hasFrontmatter: false,
      overriddenKeys: [],
    });
  });

  it("keeps malformed frontmatter non-fatal", () => {
    expect(getFrontmatterOverrides("---\nconfig: [\n---\nflowchart LR")).toEqual({
      hasFrontmatter: true,
      overriddenKeys: [],
      error: "Frontmatter 配置格式无法解析",
    });
  });
});
