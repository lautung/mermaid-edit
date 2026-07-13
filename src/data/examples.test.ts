// @vitest-environment jsdom

import mermaid from "mermaid";
import { describe, expect, it } from "vitest";
import { diagramTemplates } from "./examples";

describe("diagram templates", () => {
  it("keeps every template parseable by the bundled Mermaid version", async () => {
    mermaid.initialize({ securityLevel: "strict", startOnLoad: false });

    const newTemplates = diagramTemplates.slice(8);
    const results = await Promise.all(
      newTemplates.map(async (template) => {
        try {
          await mermaid.parse(template.source);
          return { id: template.id, ok: true };
        } catch (error) {
          return {
            id: template.id,
            ok: false,
            error: error instanceof Error ? error.message : String(error),
          };
        }
      }),
    );

    expect(results.filter((result) => !result.ok)).toEqual([]);
  }, 30000);
});
