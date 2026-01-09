import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Optimize chunk splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunk for React ecosystem
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          // UI library chunk
          "vendor-ui": ["framer-motion", "lucide-react", "class-variance-authority", "clsx", "tailwind-merge"],
          // Supabase chunk
          "vendor-supabase": ["@supabase/supabase-js"],
          // Query chunk
          "vendor-query": ["@tanstack/react-query"],
        },
      },
    },
    // Enable source maps for production debugging (optional)
    sourcemap: false,
    // Minify output
    minify: "esbuild",
    // Target modern browsers for smaller bundle
    target: "es2020",
  },
}));
