import type { ExportFormat } from "../types";
import { Canvg } from "canvg";

type RasterOptions = {
  scale: number;
  background: string;
  mimeType: "image/png" | "image/jpeg";
};

export function downloadSvg(svg: string, filename = "diagram.svg") {
  downloadBlob(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }), filename);
}

export async function downloadRaster(
  svg: string,
  format: Extract<ExportFormat, "png" | "jpg">,
  scale: number,
) {
  const mimeType = format === "png" ? "image/png" : "image/jpeg";
  const blob = await svgToRasterBlob(svg, {
    scale,
    mimeType,
    background: format === "png" ? "transparent" : "#ffffff",
  });

  downloadBlob(blob, `diagram.${format}`);
}

export async function copySvg(svg: string) {
  await navigator.clipboard.writeText(svg);
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

async function svgToRasterBlob(svg: string, options: RasterOptions) {
  const preparedSvg = ensureSvgSize(svg);
  const canvas = document.createElement("canvas");
  const width = Math.ceil(preparedSvg.width * options.scale);
  const height = Math.ceil(preparedSvg.height * options.scale);
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("当前浏览器不支持 Canvas 导出");
  }

  if (options.background !== "transparent") {
    context.fillStyle = options.background;
    context.fillRect(0, 0, width, height);
  }

  context.scale(options.scale, options.scale);

  const renderer = await Canvg.fromString(context, preparedSvg.svg, {
    ignoreAnimation: true,
    ignoreMouse: true,
  });
  await renderer.render();

  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("导出图片失败"));
          return;
        }
        resolve(blob);
      },
      options.mimeType,
      options.mimeType === "image/jpeg" ? 0.94 : undefined,
    );
  });
}

function ensureSvgSize(svg: string) {
  const parser = new DOMParser();
  const documentNode = parser.parseFromString(svg, "image/svg+xml");
  const svgElement = documentNode.querySelector("svg");

  if (!svgElement) {
    throw new Error("没有可导出的 SVG");
  }

  const viewBox = svgElement.getAttribute("viewBox");
  const dimensions = viewBox
    ? getDimensionsFromViewBox(viewBox)
    : {
        width: readLength(svgElement.getAttribute("width")) ?? 1200,
        height: readLength(svgElement.getAttribute("height")) ?? 800,
      };

  svgElement.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  svgElement.setAttribute("width", String(dimensions.width));
  svgElement.setAttribute("height", String(dimensions.height));

  const serializer = new XMLSerializer();
  return {
    svg: serializer.serializeToString(svgElement),
    width: dimensions.width,
    height: dimensions.height,
  };
}

function getDimensionsFromViewBox(viewBox: string) {
  const [, , width, height] = viewBox.split(/\s+/).map(Number);
  return {
    width: Number.isFinite(width) && width > 0 ? width : 1200,
    height: Number.isFinite(height) && height > 0 ? height : 800,
  };
}

function readLength(value: string | null) {
  if (!value) {
    return null;
  }

  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}
