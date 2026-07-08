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
];

export const initialDiagram = diagramTemplates[0].source;
