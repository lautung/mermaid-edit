import type { DiagramKind, SyntaxRepairRule } from "./types";

type RuleDefinition = Omit<SyntaxRepairRule, "id" | "diagramKind"> & {
  id: string;
};

type DiagramDefinition = {
  kind: DiagramKind;
  header: RegExp;
  rules: readonly [RuleDefinition, RuleDefinition];
};

const incompleteLine = (pattern: RegExp) => (source: string) =>
  source.split("\n").some((line) => pattern.test(line.trimEnd()));

const firstMatchingLine = (pattern: RegExp) => (source: string) => {
  const index = source.split("\n").findIndex((line) => pattern.test(line.trimEnd()));
  return index < 0 ? undefined : index + 1;
};

const diagramDefinitions: readonly DiagramDefinition[] = [
  {
    kind: "flowchart",
    header: /^\s*(?:flowchart|graph)\b/im,
    rules: [
      rule("direction", "补全流程方向", "流程图声明后需要方向，例如 TD 或 LR。", "flowchart TD", /^\s*(?:flowchart|graph)\s*$/i),
      rule("connection", "补全流程连线", "流程连线需要完整的目标节点。", "new_node[新节点]", /--?>?\s*$/),
    ],
  },
  {
    kind: "sequence",
    header: /^\s*sequenceDiagram\b/im,
    rules: [
      rule("participant", "补全参与者", "参与者声明需要名称。", "participant new_actor as 新参与者", /^\s*participant\s*$/i),
      rule("message", "补全消息", "时序消息需要完整的接收方和内容。", "new_actor->>target_actor: 新消息", /(?:-->>|->>|-->|->)\s*$/),
    ],
  },
  {
    kind: "class",
    header: /^\s*classDiagram\b/im,
    rules: [
      rule("class", "补全类声明", "类图需要完整的类名称。", "class NewClass", /^\s*class\s*$/i),
      rule("relation", "补全类关系", "类关系需要完整的目标类。", "NewClass --> TargetClass", /--?>?\s*$/),
    ],
  },
  {
    kind: "state",
    header: /^\s*stateDiagram(?:-v2)?\b/im,
    rules: [
      rule("state", "补全状态", "状态声明需要名称。", "state NewState", /^\s*state\s*$/i),
      rule("transition", "补全状态转换", "状态转换需要完整的目标状态。", "NewState --> TargetState", /--?>?\s*$/),
    ],
  },
  {
    kind: "er",
    header: /^\s*erDiagram\b/im,
    rules: [
      rule("relationship", "补全实体关系", "ER 图关系需要左右实体与关系符号。", "ENTITY_A ||--o{ ENTITY_B : 包含", /\|\|--o\{\s*$/),
      rule("field", "补全实体字段", "实体字段需要类型和名称。", "string field_name", /^\s*(?:string|int|float|boolean)\s*$/i),
    ],
  },
  {
    kind: "gantt",
    header: /^\s*gantt\b/im,
    rules: [
      rule("date-format", "补全日期格式", "甘特图日期格式需要写在 dateFormat 后。", "dateFormat YYYY-MM-DD", /^\s*dateFormat\s*$/i),
      rule("task", "补全甘特任务", "任务需要名称和时间定义。", "新任务 : task_1, 2026-01-01, 1d", /:\s*$/),
    ],
  },
  {
    kind: "git",
    header: /^\s*gitGraph\b/im,
    rules: [
      rule("commit", "补全提交", "Git 图提交需要 id。", "commit id: \"new_commit\"", /^\s*commit\s*$/i),
      rule("branch", "补全分支", "Git 图分支需要名称。", "branch feature/new_branch", /^\s*branch\s*$/i),
    ],
  },
  {
    kind: "journey",
    header: /^\s*journey\b/im,
    rules: [
      rule("section", "补全旅程分段", "用户旅程分段需要名称。", "section 新阶段", /^\s*section\s*$/i),
      rule("task", "补全旅程任务", "旅程任务需要分值与参与者。", "新任务: 5: new_actor", /:\s*$/),
    ],
  },
  {
    kind: "pie",
    header: /^\s*pie(?:\s|$)/im,
    rules: [
      rule("title", "补全饼图标题", "饼图标题需要文本。", "title 新标题", /^\s*pie\s+title\s*$/i),
      rule("value", "补全饼图数据", "饼图数据需要带引号的标签和数值。", "\"新分类\" : 1", /:\s*$/),
    ],
  },
  {
    kind: "quadrant",
    header: /^\s*quadrantChart\b/im,
    rules: [
      rule("axis", "补全象限坐标轴", "象限图坐标轴需要左右或上下两个标签。", "x-axis 低收益 --> 高收益", /^\s*[xy]-axis\s*$/i),
      rule("point", "补全象限数据点", "象限数据点需要两个坐标值。", "new_point: [0.5, 0.5]", /:\s*\[$/),
    ],
  },
  {
    kind: "requirement",
    header: /^\s*requirementDiagram\b/im,
    rules: [
      rule("requirement", "补全需求块", "需求图需要完整的需求名称与字段。", "requirement new_requirement {\n  id: 1\n  text: \"新需求\"\n  risk: Low\n  verifymethod: Test\n}", /^\s*requirement\s*$/i),
      rule("relation", "补全需求关系", "需求关系需要完整的两端和关系类型。", "new_element - satisfies -> new_requirement", /-\s*(?:satisfies|verifies|traces)?\s*->\s*$/i),
    ],
  },
  {
    kind: "mindmap",
    header: /^\s*mindmap\b/im,
    rules: [
      rule("root", "补全思维导图根节点", "思维导图需要根节点。", "root((新主题))", /^\s*root\s*$/i),
      rule("child", "补全思维导图子节点", "子节点需要在父节点下缩进声明。", "  new_child[新节点]", /^\s{2,}$/),
    ],
  },
  {
    kind: "timeline",
    header: /^\s*timeline\b/im,
    rules: [
      rule("title", "补全时间线标题", "时间线标题需要文本。", "title 新时间线", /^\s*title\s*$/i),
      rule("event", "补全时间线事件", "时间线事件需要时间点和描述。", "2026 : 新事件", /:\s*$/),
    ],
  },
  {
    kind: "sankey",
    header: /^\s*sankey(?:-beta)?\b/im,
    rules: [
      rule("csv-columns", "补全 Sankey 数据列", "Sankey 每行需要来源、目标和数值三列。", "source_node,target_node,1", /^[^,\n]+,[^,\n]*$/),
      rule("value", "补全 Sankey 数值", "Sankey 的第三列必须是数值。", "source_node,target_node,1", /^[^,\n]+,[^,\n]+,\s*$/),
    ],
  },
  {
    kind: "xychart",
    header: /^\s*xychart(?:-beta)?\b/im,
    rules: [
      rule("axis", "补全 XY 坐标轴", "XY 图需要完整的坐标轴定义。", "x-axis [\"1\", \"2\"]", /^\s*[xy]-axis\s*$/i),
      rule("series", "补全 XY 数据系列", "XY 图数据系列需要数值数组。", "bar [1, 2]", /^\s*(?:bar|line)\s*$/i),
    ],
  },
  {
    kind: "block",
    header: /^\s*block\b/im,
    rules: [
      rule("columns", "补全块图列数", "块图列数需要正整数。", "columns 2", /^\s*columns\s*$/i),
      rule("block", "补全块图节点", "块图节点需要标识符和标签。", "new_block[新模块]", /^\s*[A-Za-z_]\w*\s*$/),
    ],
  },
  {
    kind: "packet",
    header: /^\s*packet(?:-beta)?\b/im,
    rules: [
      rule("range", "补全数据包位区间", "数据包字段需要位区间。", "0-7: \"新字段\"", /^\s*\d+\s*$/),
      rule("label", "补全数据包字段标签", "数据包字段标签需要双引号。", "0-7: \"新字段\"", /^\s*\d+(?:-\d+)?:\s*$/),
    ],
  },
  {
    kind: "kanban",
    header: /^\s*kanban\b/im,
    rules: [
      rule("column", "补全看板列", "看板列需要标识符和标题。", "new_column[新列]", /^\s*[A-Za-z_]\w*\s*$/),
      rule("task", "补全看板任务", "看板任务需要在列下缩进声明。", "  new_task[新任务]", /^\s{2,}$/),
    ],
  },
  {
    kind: "architecture",
    header: /^\s*architecture(?:-beta)?\b/im,
    rules: [
      rule("service", "补全架构服务", "架构服务需要类型、标识符和标签。", "service new_service(server)[新服务]", /^\s*service\s*$/i),
      rule("relation", "补全架构关系", "架构关系需要两端服务和方向。", "new_service:R -- L:target_service", /--\s*$/),
    ],
  },
  {
    kind: "radar",
    header: /^\s*radar(?:-beta)?\b/im,
    rules: [
      rule("axis", "补全雷达坐标轴", "雷达图坐标轴需要至少一个维度。", 'axis quality["质量"]', /^\s*axis\s*$/i),
      rule("curve", "补全雷达曲线", "雷达曲线需要名称和数值集合。", "curve current[\"当前\"]{1, 2}", /^\s*curve\s*$/i),
    ],
  },
  {
    kind: "treemap",
    header: /^\s*treemap(?:-beta)?\b/im,
    rules: [
      rule("node", "补全树状图节点", "树状图节点需要带引号的名称。", "\"新分类\"", /^\s*"?\s*$/),
      rule("leaf", "补全树状图叶子值", "树状图叶子需要数值。", "\"新项目\": 1", /:\s*$/),
    ],
  },
  {
    kind: "venn",
    header: /^\s*venn(?:-beta)?\b/im,
    rules: [
      rule("set", "补全集合", "韦恩图集合需要标识符、标签和数值。", "set A[\"新集合\"]:1", /^\s*set\s*$/i),
      rule("union", "补全集合交集", "韦恩图交集需要集合标识符和数值。", "union A,B[\"交集\"]:1", /^\s*union\s*$/i),
    ],
  },
];

export const repairRules: readonly SyntaxRepairRule[] = diagramDefinitions.flatMap(({ kind, header, rules }) =>
  rules.map((definition) => ({
    ...definition,
    id: `${kind}.${definition.id}`,
    diagramKind: kind,
    matches: (source) => header.test(source) && definition.matches(source),
  })),
);

function rule(
  id: string,
  title: string,
  summary: string,
  snippet: string,
  pattern: RegExp,
): RuleDefinition {
  return {
    id,
    title,
    summary,
    snippet,
    matches: incompleteLine(pattern),
    line: firstMatchingLine(pattern),
  };
}
