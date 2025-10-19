import type { UserConfig } from 'vite'
import { resolve } from 'node:path'
import process from 'node:process'
import Uni from '@dcloudio/vite-plugin-uni'
import Components from '@uni-helper/vite-plugin-uni-components'
import { WotResolver } from '@uni-helper/vite-plugin-uni-components/resolvers'
import Optimization from '@uni-ku/bundle-optimizer'
import UniKuRoot from '@uni-ku/root'
import { UniEchartsResolver } from 'uni-echarts/resolver'
import { defineConfig } from 'vite'

console.log('process.env.NODE_ENV', process.env.NODE_ENV)

// https://vitejs.dev/config/
export default defineConfig(async () => {
  const UnoCss = await import('unocss/vite').then(i => i.default)
  const Jsx = await import('@vitejs/plugin-vue-jsx').then(i => i.default)
  const UniEcharts = await import('uni-echarts/vite').then(i => i.UniEcharts)

  return {
    plugins: [
      // make sure put it before `Uni()`
      Components({
        extensions: ['vue', 'tsx'],
        include: [
          /\.[tj]sx?$/, // .ts, .tsx, .js, .jsx
          /\.vue$/,
          /\.vue\?vue/, // .vue
        ],
        excludeNames: ['NOT'],
        directoryAsNamespace: true,
        resolvers: [WotResolver(), UniEchartsResolver()],
      }),
      UniEcharts(),
      UniKuRoot(),
      Jsx(),
      UnoCss(),
      Uni(),
      Optimization(),
    ],
    resolve: {
      alias: [{ find: '~/', replacement: `${resolve(__dirname, 'src')}/` }],
    },
    optimizeDeps: {
      exclude: ['uni-echarts', 'wot-design-uni'],
    },
    build: {
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true, // 生产环境移除console
          drop_debugger: true, // 生产环境移除debugger
        },
      },
    },
  } as UserConfig
})
