import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
    // Proxy para redirigir peticiones /graphql al backend en http://localhost:4000
    proxy: {
      "/graphql": {
        target: "http://localhost:4000", // puerto del backend (ajusta si tu backend usa otro)
        changeOrigin: true,
        secure: false,
      },
      // opcional, si también tienes rutas de API REST:
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true,
        secure: false,
      }
    }
  }
}));