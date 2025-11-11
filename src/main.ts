import { createPinia } from 'pinia'
import { createSSRApp } from 'vue'
import App from './App.vue'
import { navigationInterceptor, requestInterceptor } from './intercepter'

import '@/styles/global.scss'
import 'uno.css'

export function createApp() {
  const app = createSSRApp(App)
  app.use(createPinia())
  requestInterceptor()
  navigationInterceptor()

  return {
    app,
  }
}
