import { defineConfig } from "vite";
import { reactRouter } from "@react-router/dev/vite";

export default defineConfig(({ mode }) => ({
  plugins: mode === "test" ? [] : [reactRouter()],
  build: {
    outDir: "dist",
    rollupOptions: {
      output: {
        manualChunks(id) {
          const normalizedId = id.replace(/\\/g, "/");

          if (!isPackagePath(normalizedId, "/node_modules/")) {
            return;
          }

          if (
            isPackagePath(normalizedId, "/node_modules/antd/") ||
            isPackagePath(normalizedId, "/node_modules/@ant-design/")
          ) {
            return "vendor-antd";
          }

          if (
            isPackagePath(normalizedId, "/node_modules/codemirror/") ||
            isPackagePath(normalizedId, "/node_modules/@codemirror/")
          ) {
            return "vendor-codemirror";
          }

          if (
            isPackagePath(normalizedId, "/node_modules/canvg/") ||
            isPackagePath(normalizedId, "/node_modules/@xmldom/") ||
            isPackagePath(normalizedId, "/node_modules/raf/")
          ) {
            return "vendor-raster-export";
          }
        },
      },
    },
  },
}));

function isPackagePath(id: string, packagePath: string) {
  return id.indexOf(packagePath) !== -1;
}
