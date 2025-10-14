import type { UserConfig } from 'vite'
import { resolve } from 'node:path'
import Uni from '@dcloudio/vite-plugin-uni'
import Components from '@uni-helper/vite-plugin-uni-components'
import { WotResolver } from '@uni-helper/vite-plugin-uni-components/resolvers'
import UniKuRoot from '@uni-ku/root'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig(async () => {
  const UnoCss = await import('unocss/vite').then(i => i.default)
  const Jsx = await import('@vitejs/plugin-vue-jsx').then(i => i.default)

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
        resolvers: [WotResolver()],
      }),
      UniKuRoot(),
      Jsx(),
      Uni(),
      UnoCss(),
    ],
    resolve: {
      alias: [{ find: '~/', replacement: `${resolve(__dirname, 'src')}/` }],
    },
  } as UserConfig
})
