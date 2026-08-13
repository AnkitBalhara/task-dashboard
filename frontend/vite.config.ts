import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Point straight at the workspace package's TS source instead of its
      // compiled CJS `dist` output. Vite's esbuild transform handles the
      // source as plain ESM (same as any other project file), which avoids
      // a CJS/ESM interop failure on `export *` that otherwise breaks in
      // dev (works in production build, silently crashes at runtime in dev).
      "@task-dashboard/shared-types": path.resolve(__dirname, "../packages/shared-types/src/index.ts"),
    },
  },
  server: {
    port: 5173,
  },
});
