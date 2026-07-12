import { repairRules } from "./repairRules";
import type { SyntaxDiagnostic } from "./types";

const manualFixHint = "请手动修改高亮错误行；安全片段仅供参照，不会替换已有代码。";

export function deriveSyntaxDiagnostic(source: string, error: unknown): SyntaxDiagnostic {
  const rawMessage = error instanceof Error ? error.message : "Mermaid 语法错误";
  const rule = repairRules.find((candidate) => candidate.matches(source));

  if (rule) {
    return {
      line: rule.line(source),
      summary: `${diagramLabel(rule.diagramKind)}：${rule.summary}`,
      manualFixHint,
      rawMessage,
      rule: {
        id: rule.id,
        title: rule.title,
        snippet: rule.snippet,
      },
    };
  }

  return {
    line: extractLine(rawMessage),
    summary: "Mermaid 语法无法解析，请检查当前错误位置附近的语法。",
    manualFixHint,
    rawMessage,
  };
}

function extractLine(message: string) {
  const match = /(?:line|第)\s*(\d+)\s*(?:行)?/i.exec(message);
  return match ? Number(match[1]) : undefined;
}

function diagramLabel(kind: string) {
  const labels: Record<string, string> = {
    flowchart: "流程图",
    sequence: "时序图",
    class: "类图",
    state: "状态图",
    er: "ER 图",
    gantt: "甘特图",
    git: "Git 图",
    journey: "用户旅程",
    pie: "饼图",
    quadrant: "象限图",
    requirement: "需求图",
    mindmap: "思维导图",
    timeline: "时间线",
    sankey: "Sankey",
    xychart: "XY 图",
    block: "块图",
    packet: "数据包图",
    kanban: "看板",
    architecture: "架构图",
    radar: "雷达图",
    treemap: "树状图",
    venn: "韦恩图",
  };

  return labels[kind] ?? "Mermaid 图表";
}
