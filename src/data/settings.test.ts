import { describe, expect, it } from "vitest";
import { defaultDiagramSettings, normalizeDiagramSettings } from "./settings";

describe("normalizeDiagramSettings", () => {
  it("falls back when the stored value is not an object", () => {
    expect(normalizeDiagramSettings(null)).toEqual(defaultDiagramSettings);
  });

  it("preserves valid stored settings", () => {
    expect(
      normalizeDiagramSettings({
        theme: "dark",
        background: "#12abef",
        fontFamily: "monospace",
        layout: "elk",
        curve: "linear",
      }),
    ).toEqual({
      theme: "dark",
      background: "#12abef",
      fontFamily: "monospace",
      layout: "elk",
      curve: "linear",
    });
  });

  it("falls back field-by-field for invalid stored settings", () => {
    expect(
      normalizeDiagramSettings({
        theme: "invalid",
        background: "url(javascript:alert(1))",
        fontFamily: "Comic Sans",
        layout: "force",
        curve: "wild",
      }),
    ).toEqual(defaultDiagramSettings);
  });

  it("keeps transparent backgrounds", () => {
    expect(normalizeDiagramSettings({ background: "transparent" }).background).toBe(
      "transparent",
    );
  });
});
