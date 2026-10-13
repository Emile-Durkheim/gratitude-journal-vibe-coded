import { createApp } from 'vue'
import '@fontsource/eb-garamond/latin-400.css'
import '@fontsource/eb-garamond/latin-400-italic.css'
import '@fontsource/eb-garamond/latin-600.css'
import '@fontsource/caveat/latin-400.css'
import '@fontsource/caveat/latin-600.css'
import App from './App.vue'
import './index.css'
import { scheduleReminder } from './reminderClient'

createApp(App).mount('#root')

scheduleReminder()
