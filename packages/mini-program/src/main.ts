import uviewPlus from 'uview-plus'
import { createSSRApp } from 'vue'
import App from './App.vue'

import 'uno.css'

export function createApp() {
  const app = createSSRApp(App)
  app.use(uviewPlus, () => {
    return {
      options: {
        config: {
          unit: 'rpx',
        },
      },
    }
  })

  return {
    app,
  }
}
