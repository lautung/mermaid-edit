export type SvgDimensions = {
  width: number;
  height: number;
};

export function getSvgDimensionsFromMarkup(svg: string): SvgDimensions | null {
  const parser = new DOMParser();
  const documentNode = parser.parseFromString(svg, "image/svg+xml");
  const svgElement = documentNode.querySelector("svg");

  return svgElement ? getSvgDimensionsFromElement(svgElement) : null;
}

export function getSvgDimensionsFromElement(svgElement: Element): SvgDimensions | null {
  const viewBox = svgElement.getAttribute("viewBox");
  if (viewBox) {
    const dimensions = getDimensionsFromViewBox(viewBox);
    if (dimensions) {
      return dimensions;
    }
  }

  const width = readSvgLength(svgElement.getAttribute("width"));
  const height = readSvgLength(svgElement.getAttribute("height"));

  return isPositiveNumber(width) && isPositiveNumber(height) ? { width, height } : null;
}

function getDimensionsFromViewBox(viewBox: string): SvgDimensions | null {
  const [, , width, height] = viewBox.trim().split(/[\s,]+/).map(Number);

  return isPositiveNumber(width) && isPositiveNumber(height) ? { width, height } : null;
}

function readSvgLength(value: string | null) {
  if (!value || value.trim().endsWith("%")) {
    return null;
  }

  const parsed = Number.parseFloat(value);
  return isPositiveNumber(parsed) ? parsed : null;
}

function isPositiveNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}
