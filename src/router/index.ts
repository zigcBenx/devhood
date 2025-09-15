import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/views/HomePage.vue'
import ProfilePage from '@/views/ProfilePage.vue'
import CallbackPage from '@/views/CallbackPage.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomePage
    },
    {
      path: '/callback',
      name: 'callback',
      component: CallbackPage
    },
    {
      path: '/:username',
      name: 'profile',
      component: ProfilePage,
      props: true
    }
  ]
})

export default router