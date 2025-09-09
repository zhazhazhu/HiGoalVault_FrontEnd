import { resolve } from 'node:path'
import uni from '@dcloudio/vite-plugin-uni'
import Components from '@uni-helper/vite-plugin-uni-components'

import { WotResolver } from '@uni-helper/vite-plugin-uni-components/resolvers'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig(async () => {
  const UnoCss = await import('unocss/vite').then(i => i.default)

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
        directoryAsNamespace: true,
        resolvers: [WotResolver()],
      }),
      uni(),
      UnoCss(),
    ],
    resolve: {
      alias: [{ find: '~/', replacement: `${resolve(__dirname, 'src')}/` }],
    },
  }
})
