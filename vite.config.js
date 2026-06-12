import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [
    react({
      include: "**/*.{js,jsx,ts,tsx}",
    }),
  ],
  define: {
    "import.meta.env.VITE_ENABLE_DEV_TOOLS": JSON.stringify(
      process.env.VITE_ENABLE_DEV_TOOLS ?? (process.env.VERCEL ? "true" : "false")
    ),
  },
  esbuild: {
    loader: "jsx",
    include: /src\/.*\.[jt]sx?$/,
    exclude: [],
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        ".js": "jsx",
      },
    },
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
