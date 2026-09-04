import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  // If you deploy to a subpath (e.g. GitHub Pages project site), set this to "/repo-name/".
  base: "/",
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "icon-192.png", "icon-512.png"],
      manifest: {
        name: "UIL Practice",
        short_name: "UIL",
        description:
          "Creative Writing and Storytelling practice for UIL A+ Academics, elementary.",
        theme_color: "#10243F",
        background_color: "#EEF1F6",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        icons: [
          { src: "icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png" },
          {
            src: "icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,ico,woff2}"],
        // Video recordings live in IndexedDB, never in the cache.
        navigateFallback: "index.html",
      },
      devOptions: { enabled: false },
    }),
  ],
  server: {
    // getUserMedia needs a secure context. localhost counts; a LAN IP does not.
    // Run `npm run dev -- --https` or use a tunnel if you test from a phone.
    port: 5173,
  },
});
