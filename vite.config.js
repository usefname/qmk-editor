import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import path from "path";

const disabledWarnings = [
  "a11y-click-events-have-key-events",
  'A11y: <a> element should have an href attribute',
  'A11y: Avoid using autofocus'
]

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte(
    {
      onwarn(warning, handler) {
        if (disabledWarnings.includes(warning.message)) {
          return;
        }
        handler(warning);
      },
    }
  )],
  resolve: {
    alias: {
      '@': path.resolve("./src"),
    }
  },

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  // prevent vite from obscuring rust errors
  clearScreen: false,
  // tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
  },
  // to make use of `TAURI_DEBUG` and other env variables
  // https://tauri.studio/v1/api/config#buildconfig.beforedevcommand
  envPrefix: ["VITE_", "TAURI_"],
  build: {
    // Tauri supports es2021
    target: process.env.TAURI_PLATFORM == "windows" ? "chrome105" : "safari13",
    // don't minify for debug builds
    minify: !process.env.TAURI_DEBUG ? "esbuild" : false,
    // produce sourcemaps for debug builds
    sourcemap: !!process.env.TAURI_DEBUG,
  },
});
