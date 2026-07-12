import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { installAuthGuard, router } from './router'
import './style.scss'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
installAuthGuard(pinia)
app.use(router)
app.mount('#app')
