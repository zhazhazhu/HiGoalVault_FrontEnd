import { resolve } from 'node:path'
import uni from '@dcloudio/vite-plugin-uni'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig(async () => {
  const UnoCss = await import('unocss/vite').then(i => i.default)

  return {
    plugins: [uni(), UnoCss()],
    resolve: {
      alias: [{ find: '~/', replacement: `${resolve(__dirname, 'src')}/` }],
    },
  }
})
