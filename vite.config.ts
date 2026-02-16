import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  // ── Security: Production Build Hardening ─────────────────
  build: {
    // Prevent source-map leaks — source maps expose the original
    // TypeScript/React source to anyone with DevTools, enabling
    // reverse-engineering, credential discovery, and attack-surface
    // mapping. Never ship them in production.
    sourcemap: false,

    // esbuild minification options (built into Vite, no Terser needed)
    minify: "esbuild",
  },

  esbuild: {
    // Strip all console.* calls and `debugger` statements in production.
    // This prevents information disclosure (tokens, PII, state dumps)
    // and removes debugging hooks an attacker could exploit.
    ...(mode === "production" && {
      drop: ["console", "debugger"],
    }),
  },
}));
