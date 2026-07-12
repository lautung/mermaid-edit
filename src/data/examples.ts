export type DiagramTemplate = {
  id: string;
  title: string;
  type: string;
  tags: string[];
  source: string;
};

export const diagramTemplates: DiagramTemplate[] = [
  {
    id: "flow-basic",
    title: "流程图 - 基础决策",
    type: "流程图",
    tags: ["常用", "技术文档"],
    source: `flowchart TD
    A[开始] --> B{是否工作正常?}
    B -->|是| C[继续工作]
    B -->|否| D[排查问题]
    D --> E{问题解决?}
    E -->|是| C
    E -->|否| F[寻求帮助]
    F --> D`,
  },
  {
    id: "sequence-login",
    title: "时序图 - 用户登录",
    type: "时序图",
    tags: ["产品流程", "接口"],
    source: `sequenceDiagram
    participant 用户
    participant 浏览器
    participant 服务器
    participant 数据库

    用户->>浏览器: 输入账号密码
    浏览器->>服务器: 提交登录请求
    服务器->>数据库: 校验凭证
    数据库-->>服务器: 返回用户信息
    服务器-->>浏览器: 返回登录结果
    浏览器-->>用户: 进入工作台`,
  },
  {
    id: "class-service",
    title: "类图 - 服务结构",
    type: "类图",
    tags: ["技术文档"],
    source: `classDiagram
    class DiagramService {
      +render(source)
      +export(format)
    }
    class TemplateStore {
      +list()
      +findByType(type)
    }
    class Exporter {
      +toSvg()
      +toPng()
      +toJpg()
    }
    DiagramService --> TemplateStore
    DiagramService --> Exporter`,
  },
  {
    id: "state-render",
    title: "状态图 - 渲染流程",
    type: "状态图",
    tags: ["常用", "工程"],
    source: `stateDiagram-v2
    [*] --> Idle
    Idle --> Rendering: 输入 Mermaid
    Rendering --> Ready: 渲染成功
    Rendering --> Error: 语法错误
    Error --> Rendering: 修正代码
    Ready --> Exporting: 点击导出
    Exporting --> Ready: 导出完成`,
  },
  {
    id: "er-project",
    title: "ER 图 - 项目管理",
    type: "ER 图",
    tags: ["数据建模"],
    source: `erDiagram
    USER ||--o{ PROJECT : owns
    PROJECT ||--o{ DIAGRAM : contains
    DIAGRAM ||--o{ EXPORT : creates
    USER {
      string id
      string name
    }
    PROJECT {
      string id
      string title
    }
    DIAGRAM {
      string id
      string source
    }`,
  },
  {
    id: "gantt-release",
    title: "甘特图 - 发布计划",
    type: "甘特图",
    tags: ["产品流程"],
    source: `gantt
    title Mermaid 编辑器发布计划
    dateFormat  YYYY-MM-DD
    section 设计
    PRD 与视觉方案      :done,    des1, 2026-07-01, 2d
    Ant Design 改造     :active,  des2, 2026-07-03, 4d
    section 验证
    浏览器导出测试       :         qa1, 2026-07-07, 2d
    上线检查             :         qa2, after qa1, 1d`,
  },
  {
    id: "git-flow",
    title: "Git 图 - 分支策略",
    type: "Git 图",
    tags: ["工程"],
    source: `gitGraph
    commit id: "init"
    branch feature/editor
    checkout feature/editor
    commit id: "ui"
    commit id: "export"
    checkout main
    merge feature/editor
    commit id: "release"`,
  },
  {
    id: "journey-docs",
    title: "用户旅程 - 文档配图",
    type: "用户旅程",
    tags: ["产品流程"],
    source: `journey
    title 技术写作者创建图表
    section 构思
      梳理流程: 4: 作者
      选择模板: 5: 作者
    section 编辑
      修改 Mermaid: 5: 作者
      检查预览: 4: 作者
    section 交付
      导出 PNG: 5: 作者
      插入文档: 5: 作者`,
  },
  {
    id: "pie-browser",
    title: "饼图 - 浏览器占比",
    type: "饼图",
    tags: ["数据", "报告"],
    source: `pie title 浏览器占比
    "Chrome" : 65
    "Edge" : 20
    "Firefox" : 15`,
  },
  {
    id: "quadrant-priority",
    title: "象限图 - 技术优先级",
    type: "象限图",
    tags: ["决策", "产品流程"],
    source: `quadrantChart
    title 技术优先级
    x-axis 低收益 --> 高收益
    y-axis 低成本 --> 高成本
    quadrant-1 重点投入
    quadrant-2 评估成本
    quadrant-3 暂缓
    quadrant-4 快速收益
    实时预览: [0.82, 0.55]
    Markdown 导入: [0.62, 0.38]`,
  },
  {
    id: "requirement-editor",
    title: "需求图 - 编辑器需求",
    type: "需求图",
    tags: ["产品", "工程"],
    source: `requirementDiagram
    requirement editorRequirement {
      id: 1
      text: "支持实时预览"
      risk: Low
      verifymethod: Test
    }
    element browserApp {
      type: system
      docref: "web-app"
    }
    browserApp - satisfies -> editorRequirement`,
  },
  {
    id: "mindmap-workbench",
    title: "思维导图 - 工作台",
    type: "思维导图",
    tags: ["规划", "知识整理"],
    source: `mindmap
  root((编辑器工作台))
    输入
      Mermaid 代码
      Markdown 导入
    预览
      实时渲染
      配置主题
    导出
      SVG
      PNG`,
  },
  {
    id: "timeline-release",
    title: "时间线 - 版本演进",
    type: "时间线",
    tags: ["规划", "项目管理"],
    source: `timeline
    title Mermaid 编辑器演进
    2024 : 原型
    2025 : 模板库
    2026 : 配置面板`,
  },
  {
    id: "sankey-flow",
    title: "桑基图 - 用户流转",
    type: "Sankey",
    tags: ["数据", "流程"],
    source: `sankey-beta
    new_users,editor,12
    returning_users,editor,8
    editor,preview,16
    editor,leave,4
    preview,export,13
    preview,continue_editing,3`,
  },
  {
    id: "xychart-performance",
    title: "XY 图 - 渲染耗时",
    type: "XY 图",
    tags: ["数据", "性能"],
    source: `xychart-beta
    title "渲染耗时"
    x-axis ["1", "2", "3", "4"]
    y-axis "毫秒" 0 --> 100
    bar [35, 48, 32, 60]
    line [35, 48, 32, 60]`,
  },
  {
    id: "block-pipeline",
    title: "块图 - 编辑流水线",
    type: "块图",
    tags: ["工程", "架构"],
    source: `block
    columns 3
    A["编辑"] B["渲染"] C["导出"]
    A --> B
    B --> C`,
  },
  {
    id: "packet-header",
    title: "数据包 - 请求头",
    type: "数据包图",
    tags: ["网络", "工程"],
    source: `packet-beta
    0-3: "版本"
    4-7: "类型"
    8-15: "长度"
    16-31: "请求 ID"`,
  },
  {
    id: "kanban-release",
    title: "看板 - 发布任务",
    type: "看板",
    tags: ["项目管理", "协作"],
    source: `kanban
      todo[Todo]
        config[设计配置面板]
        templates[补充图表模板]
      progress[In Progress]
        markdown[实现 Markdown 导入]
      done[Done]
        preview[实时预览]
        svg[SVG 导出]`,
  },
  {
    id: "architecture-editor",
    title: "架构图 - 编辑器模块",
    type: "架构图",
    tags: ["架构", "工程"],
    source: `architecture-beta
    group app(cloud)[Editor]
    service editor(server)[Code Editor] in app
    service preview(server)[Preview] in app
    service exporter(server)[Exporter] in app
    editor:R -- L:preview
    preview:R -- L:exporter`,
  },
  {
    id: "radar-skills",
    title: "雷达图 - 能力评估",
    type: "雷达图",
    tags: ["数据", "评估"],
    source: `radar-beta
    title 编辑器能力评估
    axis experience["体验"], performance["性能"], extensibility["可扩展性"], compatibility["兼容性"]
    curve current["当前版本"]{4, 3, 2, 4}
    curve target["目标版本"]{5, 5, 5, 5}
    max 5`,
  },
  {
    id: "treemap-modules",
    title: "树状图 - 模块占比",
    type: "树状图",
    tags: ["数据", "架构"],
    source: `treemap-beta
    "编辑器"
    "编辑器/代码" : 35
    "编辑器/预览" : 25
    "编辑器/配置" : 15
    "编辑器/导出" : 25`,
  },
  {
    id: "venn-features",
    title: "韦恩图 - 功能交集",
    type: "韦恩图",
    tags: ["数据", "分析"],
    source: `venn-beta
    set A["编辑器能力"]:80
    set B["导出能力"]:60
    union A,B["完整工作流"]:40`,
  },
];

export const initialDiagram = diagramTemplates[0].source;
