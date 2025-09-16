import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/views/HomePage.vue'
import ProfilePage from '@/views/ProfilePage.vue'
import CallbackPage from '@/views/CallbackPage.vue'
import ClaimProfilePage from '@/views/ClaimProfilePage.vue'
import OAuthCallbackPage from '@/views/OAuthCallbackPage.vue'
import TestCallbackPage from '@/views/TestCallbackPage.vue'

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
      path: '/auth/github/callback',
      name: 'github-callback',
      component: OAuthCallbackPage
    },
    {
      path: '/auth/gitlab/callback',
      name: 'gitlab-callback',
      component: OAuthCallbackPage
    },
    {
      path: '/claim/:username',
      name: 'claim-profile',
      component: ClaimProfilePage,
      props: true
    },
    {
      path: '/:username',
      name: 'profile',
      component: ProfilePage,
      props: true
    }
  ]
})

// Add router guards for debugging
router.beforeEach((to, from, next) => {
  console.log('🗺️ ROUTER NAVIGATION:')
  console.log('  From:', from.path)
  console.log('  To:', to.path)
  console.log('  Route name:', to.name)
  console.log('  Route params:', to.params)

  // Special handling for auth callback
  if (to.path.includes('/auth/') && to.path.includes('/callback')) {
    console.log('🔥 INTERCEPTING AUTH CALLBACK ROUTE')
    console.log('🔥 Full URL:', window.location.href)
    console.log('🔥 Route query:', to.query)
  }

  next()
})

router.afterEach((to, from) => {
  console.log('✅ ROUTER NAVIGATION COMPLETE:')
  console.log('  Current route:', to.path)
  console.log('  Route name:', to.name)
})

export default router