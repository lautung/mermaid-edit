// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { downloadMarkdown, downloadRaster, downloadSvg } from "./exportDiagram";

const canvgMocks = vi.hoisted(() => ({
  fromString: vi.fn(),
  render: vi.fn(),
}));

vi.mock("canvg", () => ({
  Canvg: {
    fromString: canvgMocks.fromString,
  },
}));

type CanvasSize = {
  width: number;
  height: number;
};

type BlobRequest = {
  type: string | undefined;
  quality: number | undefined;
};

const rasterBlob = new Blob(["raster"], { type: "image/png" });

let canvasSize: CanvasSize | null;
let blobRequest: BlobRequest | null;
let clickedDownload: string | null;
let canvasContext: {
  fillStyle: string;
  fillRect: ReturnType<typeof vi.fn>;
  scale: ReturnType<typeof vi.fn>;
};

beforeEach(() => {
  canvasSize = null;
  blobRequest = null;
  clickedDownload = null;
  canvasContext = {
    fillStyle: "",
    fillRect: vi.fn(),
    scale: vi.fn(),
  };

  canvgMocks.render.mockReset();
  canvgMocks.fromString.mockReset();
  canvgMocks.render.mockResolvedValue(undefined);
  canvgMocks.fromString.mockResolvedValue({ render: canvgMocks.render });

  vi.stubGlobal("URL", {
    createObjectURL: vi.fn(() => "blob:diagram"),
    revokeObjectURL: vi.fn(),
  });
  vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (
    this: HTMLAnchorElement,
  ) {
    clickedDownload = this.download;
  });
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(
    ((() => canvasContext as unknown as CanvasRenderingContext2D) as unknown) as HTMLCanvasElement["getContext"],
  );
  vi.spyOn(HTMLCanvasElement.prototype, "toBlob").mockImplementation(function (
    this: HTMLCanvasElement,
    callback: BlobCallback,
    type?: string,
    quality?: number,
  ) {
    canvasSize = { width: this.width, height: this.height };
    blobRequest = { type, quality };
    callback(rasterBlob);
  });
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("downloadRaster", () => {
  it("sanitizes SVG download filenames", () => {
    downloadSvg("<svg></svg>", "bad<name>");

    expect(clickedDownload).toBe("bad-name-.svg");
  });

  it("sanitizes Markdown download filenames", () => {
    downloadMarkdown("```mermaid\nflowchart LR\n  A --> B\n```", "bad/name");

    expect(clickedDownload).toBe("bad-name.md");
  });

  it("falls back when download filenames are blank", () => {
    downloadSvg("<svg></svg>", "   ");

    expect(clickedDownload).toBe("diagram.svg");
  });

  it("does not duplicate existing filename extensions", () => {
    downloadSvg("<svg></svg>", "diagram.svg");

    expect(clickedDownload).toBe("diagram.svg");
  });

  it("falls back for blank Markdown filenames", () => {
    downloadMarkdown("```mermaid\nflowchart LR\n  A --> B\n```", "");

    expect(clickedDownload).toBe("diagram.md");
  });

  it("uses comma-separated viewBox dimensions for raster export", async () => {
    await downloadRaster(
      "<svg viewBox='0,0,320,160'><rect width='320' height='160' /></svg>",
      "png",
      2,
    );

    expect(canvasSize).toEqual({ width: 640, height: 320 });
    expect(canvasContext.scale).toHaveBeenCalledWith(2, 2);
    expect(canvgMocks.fromString).toHaveBeenCalledWith(
      canvasContext,
      expect.stringContaining('width="320"'),
      expect.objectContaining({ ignoreAnimation: true, ignoreMouse: true }),
    );
    expect(canvgMocks.fromString.mock.calls[0][1]).toContain('height="160"');
  });

  it("uses whitespace-separated viewBox dimensions for raster export", async () => {
    await downloadRaster(
      "<svg viewBox='0 0 300 150'><rect width='300' height='150' /></svg>",
      "png",
      1,
    );

    expect(canvasSize).toEqual({ width: 300, height: 150 });
  });

  it("falls back to safe dimensions when the SVG has no usable size", async () => {
    await downloadRaster("<svg><rect /></svg>", "png", 1);

    expect(canvasSize).toEqual({ width: 1200, height: 800 });
    expect(canvgMocks.fromString.mock.calls[0][1]).toContain('width="1200"');
    expect(canvgMocks.fromString.mock.calls[0][1]).toContain('height="800"');
  });

  it("uses a white JPEG background when the requested background is transparent", async () => {
    await downloadRaster(
      "<svg viewBox='0 0 120 80'><rect width='120' height='80' /></svg>",
      "jpg",
      1,
      { background: "transparent" },
    );

    expect(canvasContext.fillStyle).toBe("#ffffff");
    expect(canvasContext.fillRect).toHaveBeenCalledWith(0, 0, 120, 80);
    expect(blobRequest).toEqual({ type: "image/jpeg", quality: 0.94 });
  });

  it("sanitizes raster download filenames", async () => {
    await downloadRaster(
      "<svg viewBox='0 0 120 80'><rect width='120' height='80' /></svg>",
      "png",
      1,
      { filename: "bad<name>" },
    );

    expect(clickedDownload).toBe("bad-name-.png");
  });

  it("reports a missing SVG root", async () => {
    await expect(downloadRaster("<span></span>", "png", 1)).rejects.toThrow("没有可导出的 SVG");
  });

  it("reports unsupported Canvas export", async () => {
    vi.mocked(HTMLCanvasElement.prototype.getContext).mockReturnValueOnce(null);

    await expect(
      downloadRaster("<svg viewBox='0 0 120 80'><rect /></svg>", "png", 1),
    ).rejects.toThrow("当前浏览器不支持 Canvas 导出");
  });

  it("reports a failed raster blob export", async () => {
    vi.mocked(HTMLCanvasElement.prototype.toBlob).mockImplementationOnce((callback) => {
      callback(null);
    });

    await expect(
      downloadRaster("<svg viewBox='0 0 120 80'><rect /></svg>", "png", 1),
    ).rejects.toThrow("导出图片失败");
  });
});
