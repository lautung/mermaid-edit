import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router";
import { ALL_TEMPLATE_TYPE } from "../data/templateFilters";
import type { PreviewTab } from "../types";

const DEFAULT_ZOOM = 100;
const MIN_ZOOM = 50;
const MAX_ZOOM = 200;
const DEFAULT_SCALE = 2;
const ALLOWED_SCALES = new Set([1, 2, 3, 4]);
const DEFAULT_FILENAME = "mermaid-diagram";
const previewTabs = new Set<PreviewTab>(["preview", "export", "error"]);

type SearchParamOptions = {
  chartTypes: string[];
};

type SetParamOptions = {
  replace?: boolean;
};

export type EditorSearchState = {
  selectedType: string;
  search: string;
  activePreviewTab: PreviewTab;
  zoom: number;
  scale: number;
  filename: string;
  setSelectedType: (type: string) => void;
  setSearch: (search: string) => void;
  setActivePreviewTab: (tab: PreviewTab) => void;
  setZoom: (zoom: number) => void;
  setScale: (scale: number) => void;
  setFilename: (filename: string) => void;
};

export function useEditorSearchParams({ chartTypes }: SearchParamOptions): EditorSearchState {
  const [searchParams, setSearchParams] = useSearchParams();
  const fallbackType = ALL_TEMPLATE_TYPE;

  const selectedType = normalizeType(searchParams.get("type"), chartTypes, fallbackType);
  const search = searchParams.get("q") ?? "";
  const activePreviewTab = normalizePreviewTab(searchParams.get("tab"));
  const zoom = normalizeZoom(searchParams.get("zoom"));
  const scale = normalizeScale(searchParams.get("scale"));
  const filename = searchParams.has("filename")
    ? (searchParams.get("filename") ?? "")
    : DEFAULT_FILENAME;

  const updateParam = useCallback(
    (key: string, value: string, options: SetParamOptions = { replace: true }) => {
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current);
          next.set(key, value);
          return next;
        },
        { replace: options.replace ?? true },
      );
    },
    [setSearchParams],
  );

  return useMemo(
    () => ({
      selectedType,
      search,
      activePreviewTab,
      zoom,
      scale,
      filename,
      setSelectedType: (type: string) => {
        updateParam("type", normalizeType(type, chartTypes, fallbackType), { replace: false });
      },
      setSearch: (nextSearch: string) => {
        updateParam("q", nextSearch);
      },
      setActivePreviewTab: (tab: PreviewTab) => {
        updateParam("tab", normalizePreviewTab(tab), { replace: false });
      },
      setZoom: (nextZoom: number) => {
        updateParam("zoom", String(clampNumber(nextZoom, MIN_ZOOM, MAX_ZOOM)));
      },
      setScale: (nextScale: number) => {
        updateParam("scale", String(ALLOWED_SCALES.has(nextScale) ? nextScale : DEFAULT_SCALE));
      },
      setFilename: (nextFilename: string) => {
        updateParam("filename", nextFilename);
      },
    }),
    [
      activePreviewTab,
      chartTypes,
      fallbackType,
      filename,
      scale,
      search,
      selectedType,
      updateParam,
      zoom,
    ],
  );
}

function normalizeType(value: string | null, chartTypes: string[], fallbackType: string) {
  if (value === ALL_TEMPLATE_TYPE) {
    return ALL_TEMPLATE_TYPE;
  }

  return value && chartTypes.includes(value) ? value : fallbackType;
}

function normalizePreviewTab(value: string | null): PreviewTab {
  return value && previewTabs.has(value as PreviewTab) ? (value as PreviewTab) : "preview";
}

function normalizeZoom(value: string | null) {
  if (value === null || value.trim() === "") {
    return DEFAULT_ZOOM;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return DEFAULT_ZOOM;
  }

  return clampNumber(Math.round(parsed), MIN_ZOOM, MAX_ZOOM);
}

function normalizeScale(value: string | null) {
  if (value === null || value.trim() === "") {
    return DEFAULT_SCALE;
  }

  const parsed = Number(value);
  return ALLOWED_SCALES.has(parsed) ? parsed : DEFAULT_SCALE;
}

function clampNumber(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
