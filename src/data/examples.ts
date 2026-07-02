export const initialDiagram = `flowchart TD
    A[输入 Mermaid 代码] --> B{实时渲染}
    B -->|通过| C[预览图表]
    B -->|错误| D[显示错误信息]
    C --> E[导出 SVG]
    C --> F[导出 PNG]
    C --> G[导出 JPG]
`;
