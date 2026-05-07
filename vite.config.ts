import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

export default defineConfig({
  plugins: [
    react(),
    svgr({
      svgrOptions: {
        icon: true,
        exportType: "named",
        namedExport: "ReactComponent",
      },
    }),
  ],
  server: {
    proxy: {
      "/api": {
        target: "https://cpanel.mcl.co.tz",
        changeOrigin: true,
        secure: true,         
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});