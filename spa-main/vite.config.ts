import path from "path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import autoprefixer from "autoprefixer"
import svgr from "vite-plugin-svgr"

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name].[hash].js`,
        chunkFileNames: `assets/[name].[hash].js`,
        assetFileNames: `assets/[name].[hash].[ext]`,
      },
    },
  },
  optimizeDeps: {
    include: ["swiper/react", "swiper/modules"],
  },
  plugins: [react(), tailwindcss(), svgr()],
  css: {
    postcss: {
      plugins: [autoprefixer()],
    },
  },
  preview: {
    allowedHosts: ["duties-sydney-projects-inflation.trycloudflare.com"],
  },
  server: {
    allowedHosts: ["duties-sydney-projects-inflation.trycloudflare.com"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
})
