import { createApp } from 'vue'
import { createAuth0 } from '@auth0/auth0-vue'
import './style.css'
import App from './App.vue'
import router from './router'
import { auth0Config } from './services/auth0'

const app = createApp(App)

app
  .use(router)
  .use(
    createAuth0({
      domain: auth0Config.domain,
      clientId: auth0Config.clientId,
      authorizationParams: auth0Config.authorizationParams
    })
  )
  .mount('#app')