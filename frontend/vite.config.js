import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/api": {
        target: "https://esdbackend.velloresemicon.com",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
