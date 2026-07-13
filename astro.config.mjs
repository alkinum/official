import { defineConfig } from "astro/config";
import svelte from "@astrojs/svelte";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://alkinum.io",
  integrations: [svelte(), sitemap()],
  devToolbar: {
    enabled: false,
  },
  vite: {
    build: {
      // Three.js is intentionally isolated from the 11 KB interactive shell.
      chunkSizeWarningLimit: 520,
    },
  },
});
