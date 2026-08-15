import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@api": path.resolve(__dirname, "./src/api"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@context": path.resolve(__dirname, "./src/context"),
      "@hooks": path.resolve(__dirname, "./src/hooks"),
      "@pages": path.resolve(__dirname, "./src/pages"),
      "@theme": path.resolve(__dirname, "./src/theme"),
      "@types": path.resolve(__dirname, "./src/types"),
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
