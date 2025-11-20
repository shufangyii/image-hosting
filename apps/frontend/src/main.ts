import { clerkPlugin } from '@clerk/vue'
import { createApp } from 'vue'

import './assets/main.css' // Updated import path

import App from './App.vue'
import router from './router'

const app = createApp(App)

const publishableKey = import.meta.env.VITE_APP_CLERK_PUBLISHABLE_KEY

if (!publishableKey) {
  throw new Error('Missing Publishable Key')
}

app.use(router)
app.use(clerkPlugin, { publishableKey })

app.mount('#app')
