import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'
import axios from './plugins/axios'
import 'roboto-fontface/css/roboto/roboto-fontface.css'
import '@mdi/font/css/materialdesignicons.css'
import VueCookies from 'vue-cookies'
import './registerServiceWorker'
import './assets/global.css'

const app = createApp(App)

app.use(router)
app.use(vuetify)
app.use(VueCookies)
app.use(axios)


app.mount('#app')
