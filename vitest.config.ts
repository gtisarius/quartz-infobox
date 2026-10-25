import { defineConfig } from "vitest/config";

export default defineConfig({
  esbuild: { jsx: "automatic", jsxImportSource: "preact" },
  plugins: [
    {
      // Load browser scripts as plain strings, the way the real build does.
      name: "inline-script-as-text",
      enforce: "pre",
      load(id) {
        if (id.endsWith(".inline.ts")) return "export default ''";
        if (id.endsWith(".scss")) return "export default 'css'";
        return null;
      },
    },
  ],
  test: {
    environment: "node",
    include: ["test/**/*.test.{ts,tsx}"],
    reporters: ["default"],
  },
});
