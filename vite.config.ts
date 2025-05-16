import {defineConfig} from 'vite'
import {chromeExtension} from 'vite-plugin-chrome-extension'
import {resolve} from 'path'

export default defineConfig({
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src'),
        },
    },
    build: {
        rollupOptions: {
            input: "src/manifest.json"

        },
    },
    plugins:
        [
            chromeExtension(), // ⬅️ 傳入 manifest 給插件
        ],
})