// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";
import { MemoryRouter, useLocation } from "react-router";
import { ALL_TEMPLATE_TYPE } from "../data/templateFilters";
import { useEditorSearchParams } from "./useEditorSearchParams";

const chartTypes = ["flowchart", "sequence", "class"];

describe("useEditorSearchParams", () => {
  afterEach(() => {
    cleanup();
  });

  test("initializes editor view state from URL search params", () => {
    render(
      <MemoryRouter initialEntries={["/?type=sequence&q=login&tab=export&zoom=150&scale=3&filename=demo"]}>
        <SearchStateHarness />
      </MemoryRouter>,
    );

    expect(screen.getByTestId("type").textContent).toBe("sequence");
    expect(screen.getByTestId("search").textContent).toBe("login");
    expect(screen.getByTestId("tab").textContent).toBe("export");
    expect(screen.getByTestId("zoom").textContent).toBe("150");
    expect(screen.getByTestId("scale").textContent).toBe("3");
    expect(screen.getByTestId("filename").textContent).toBe("demo");
  });

  test("normalizes invalid URL values before they reach controls", () => {
    render(
      <MemoryRouter initialEntries={["/?type=unknown&tab=missing&zoom=&scale="]}>
        <SearchStateHarness />
      </MemoryRouter>,
    );

    expect(screen.getByTestId("type").textContent).toBe(ALL_TEMPLATE_TYPE);
    expect(screen.getByTestId("tab").textContent).toBe("preview");
    expect(screen.getByTestId("zoom").textContent).toBe("100");
    expect(screen.getByTestId("scale").textContent).toBe("2");
    expect(screen.getByTestId("filename").textContent).toBe("mermaid-diagram");
  });

  test("keeps the all-templates filter in URL state", () => {
    render(
      <MemoryRouter initialEntries={["/?type=all"]}>
        <SearchStateHarness />
      </MemoryRouter>,
    );

    expect(screen.getByTestId("type").textContent).toBe(ALL_TEMPLATE_TYPE);
  });

  test("clamps out-of-range zoom values", () => {
    render(
      <MemoryRouter initialEntries={["/?zoom=999"]}>
        <SearchStateHarness />
      </MemoryRouter>,
    );

    expect(screen.getByTestId("zoom").textContent).toBe("200");
  });

  test("updates URL params while preserving unrelated params", () => {
    render(
      <MemoryRouter initialEntries={["/?utm=docs"]}>
        <SearchStateHarness />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: "set type" }));
    fireEvent.click(screen.getByRole("button", { name: "set search" }));
    fireEvent.click(screen.getByRole("button", { name: "set tab" }));
    fireEvent.click(screen.getByRole("button", { name: "set zoom" }));
    fireEvent.click(screen.getByRole("button", { name: "set scale" }));
    fireEvent.click(screen.getByRole("button", { name: "set filename" }));

    expect(screen.getByTestId("location").textContent).toBe(
      "/?utm=docs&type=class&q=docs&tab=error&zoom=150&scale=4&filename=diagram-1",
    );
  });
});

function SearchStateHarness() {
  const state = useEditorSearchParams({ chartTypes });
  const location = useLocation();

  return (
    <div>
      <span data-testid="type">{state.selectedType}</span>
      <span data-testid="search">{state.search}</span>
      <span data-testid="tab">{state.activePreviewTab}</span>
      <span data-testid="zoom">{state.zoom}</span>
      <span data-testid="scale">{state.scale}</span>
      <span data-testid="filename">{state.filename}</span>
      <span data-testid="location">{`${location.pathname}${location.search}`}</span>
      <button type="button" onClick={() => state.setSelectedType("class")}>
        set type
      </button>
      <button type="button" onClick={() => state.setSearch("docs")}>
        set search
      </button>
      <button type="button" onClick={() => state.setActivePreviewTab("error")}>
        set tab
      </button>
      <button type="button" onClick={() => state.setZoom(150)}>
        set zoom
      </button>
      <button type="button" onClick={() => state.setScale(4)}>
        set scale
      </button>
      <button type="button" onClick={() => state.setFilename("diagram-1")}>
        set filename
      </button>
    </div>
  );
}
