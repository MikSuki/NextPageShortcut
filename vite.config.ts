import { defineConfig } from "vite"
import { resolve } from "path"
import { viteStaticCopy } from 'vite-plugin-static-copy'

export default defineConfig({
    build: {
        outDir: "dist",
        emptyOutDir: true,
        rollupOptions: {
            input: {
                content: resolve(__dirname, "src/content.ts"),
                background: resolve(__dirname, "src/background.ts")
            },
            output: {
                entryFileNames: "[name].js"
            }
        }
    },
    plugins: [
        viteStaticCopy({
            targets: [
                {
                    src: 'manifest.json',
                    dest: '.'  // '.' 代表複製到 dist 根目錄
                }
            ]
        })
    ]
})
