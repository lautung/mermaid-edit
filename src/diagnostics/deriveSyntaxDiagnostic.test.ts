import { describe, expect, test } from "vitest";
import { deriveSyntaxDiagnostic } from "./deriveSyntaxDiagnostic";
import { repairRules } from "./repairRules";

describe("Mermaid syntax diagnostics", () => {
  test("keeps two specialized repair rules for every supported diagram type", () => {
    const rulesByDiagram = repairRules.reduce<Map<string, typeof repairRules>>((groups, rule) => {
      groups.set(rule.diagramKind, [...(groups.get(rule.diagramKind) ?? []), rule]);
      return groups;
    }, new Map());

    expect(rulesByDiagram.size).toBe(22);
    expect(repairRules).toHaveLength(44);
    expect([...rulesByDiagram.values()].every((rules) => rules.length === 2)).toBe(true);
  });

  test("explains and locates an invalid flowchart connection", () => {
    const source = "flowchart TD\n  start[开始] -->";

    expect(deriveSyntaxDiagnostic(source, new Error("Parse error on line 2"))).toMatchObject({
      line: 2,
      summary: expect.stringContaining("流程图"),
      manualFixHint: expect.stringContaining("手动修改"),
      rule: {
        id: "flowchart.connection",
        snippet: expect.stringContaining("new_node"),
      },
    });
  });
});
