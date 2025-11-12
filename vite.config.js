import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 3000,
  },
  plugins: [react()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          ui: [
            "@radix-ui/react-select",
            "@radix-ui/react-dialog",
            "@radix-ui/react-toast",
          ],
          router: ["react-router-dom"],
          utils: ["lucide-react", "sonner", "tailwind-merge", "clsx"],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
}));
