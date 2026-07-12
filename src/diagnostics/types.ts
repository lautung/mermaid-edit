export type DiagramKind =
  | "flowchart"
  | "sequence"
  | "class"
  | "state"
  | "er"
  | "gantt"
  | "git"
  | "journey"
  | "pie"
  | "quadrant"
  | "requirement"
  | "mindmap"
  | "timeline"
  | "sankey"
  | "xychart"
  | "block"
  | "packet"
  | "kanban"
  | "architecture"
  | "radar"
  | "treemap"
  | "venn";

export type SyntaxRepairRule = {
  id: string;
  diagramKind: DiagramKind;
  title: string;
  summary: string;
  snippet: string;
  matches: (source: string) => boolean;
  line: (source: string) => number | undefined;
};

export type SyntaxDiagnostic = {
  line?: number;
  summary: string;
  manualFixHint: string;
  rawMessage: string;
  rule?: Pick<SyntaxRepairRule, "id" | "title" | "snippet">;
};
