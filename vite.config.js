import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],

  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: false,
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
    },

    proxy: {
      "/api": {
        // target: "http://10.192.168.204:5102",
        target: "http://192.168.10.14:5102",
        changeOrigin: true,
      },
      "/uploads": {
        // target: "http://10.192.168.204:5102",
        target: "http://192.168.10.14:5102",
        changeOrigin: true,
      },
    },
  },

  build: {
    chunkSizeWarningLimit: 1024,

    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: "vendor-react",
              test: /node_modules[\\/]react/,
              priority: 20,
            },
            {
              name: "vendor-ui",
              test: /node_modules[\\/](sweetalert2|react-tooltip|lucide-react)/,
              priority: 15,
            },
            {
              name: "vendor-other",
              test: /node_modules/,
              priority: 10,
            },
          ],
        },
      },
    },
  },
});
