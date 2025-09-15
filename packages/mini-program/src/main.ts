import { createPinia } from 'pinia'
import { createSSRApp } from 'vue'
import App from './App.vue'
import { requestInterceptor } from './intercepter'

import 'uno.css'

export function createApp() {
  const app = createSSRApp(App)
  app.use(createPinia())
  requestInterceptor()

  return {
    app,
  }
}
