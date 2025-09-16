<template>
  <div class="min-h-screen bg-black text-green-400 font-mono flex items-center justify-center">
    <!-- Animated background grid -->
    <div class="absolute inset-0 bg-[linear-gradient(rgba(0,255,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.03)_1px,transparent_1px)] bg-[size:20px_20px] animate-pulse"></div>

    <div class="relative z-10 text-center">
      <div class="bg-gray-900/80 border border-green-500/30 rounded-lg p-8 backdrop-blur-sm max-w-md">
        <!-- Processing State -->
        <div v-if="processing">
          <div class="flex items-center justify-center mb-4">
            <div class="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h2 class="text-xl font-bold text-green-400 mb-2">Processing Authentication</h2>
          <p class="text-green-300/60 mb-4">{{ statusMessage }}</p>
          <p class="text-xs text-green-300/40">Component mounted and processing...</p>
          <div class="flex items-center gap-2 justify-center">
            <div class="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
            <div class="w-2 h-2 rounded-full bg-green-400 animate-pulse" style="animation-delay: 0.5s"></div>
            <div class="w-2 h-2 rounded-full bg-green-400 animate-pulse" style="animation-delay: 1s"></div>
          </div>
        </div>

        <!-- Success State -->
        <div v-else-if="success">
          <div class="text-4xl mb-4">✅</div>
          <h2 class="text-xl font-bold text-green-400 mb-2">Authentication Successful</h2>
          <p class="text-green-300/60 mb-4">{{ provider }} connected successfully!</p>
          <p class="text-sm text-green-300/40">Redirecting back to profile claiming...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error">
          <div class="text-4xl mb-4">❌</div>
          <h2 class="text-xl font-bold text-red-400 mb-2">Authentication Failed</h2>
          <p class="text-red-300/80 mb-4">{{ errorMessage }}</p>
          <div class="space-y-2">
            <button
              @click="retry"
              class="w-full px-4 py-2 bg-green-500 text-black rounded hover:bg-green-400 transition-colors font-semibold"
            >
              Try Again
            </button>
            <button
              @click="goHome"
              class="w-full px-4 py-2 border border-green-500/30 text-green-400 rounded hover:border-green-400 transition-colors"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { apiService } from '@/services/api'

const route = useRoute()
const router = useRouter()

const processing = ref(true)
const success = ref(false)
const error = ref(false)
const statusMessage = ref('Connecting to authentication service...')
const errorMessage = ref('')
const provider = ref('')
const username = ref('')

const handleOAuthCallback = async () => {
  console.log('🔥 STARTING handleOAuthCallback function')
  try {
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')
    const state = urlParams.get('state')
    const error_param = urlParams.get('error')
    const error_description = urlParams.get('error_description')

    console.log('🔥 URL Params extracted:', { code: code?.substring(0, 10) + '...', state, error_param })

    // Extract provider from route path
    provider.value = route.path.includes('github') ? 'GitHub' : 'GitLab'

    // Get username from state parameter
    username.value = state || 'unknown'

    console.log('OAuth Callback Debug:', {
      provider: provider.value,
      username: username.value,
      code: code?.substring(0, 10) + '...',
      state,
      currentUrl: window.location.href
    })

    if (error_param) {
      console.log('❌ OAuth error parameter found:', error_param)
      throw new Error(error_description || error_param)
    }

    if (!code) {
      console.log('❌ No code parameter found')
      throw new Error('No authorization code received')
    }

    if (!state) {
      console.log('❌ No state parameter found')
      throw new Error('No username found in callback')
    }

    console.log('✅ All required parameters present, proceeding with token exchange')
    statusMessage.value = `Exchanging ${provider.value} authorization code...`

    // Exchange code for token
    console.log('🔄 Making API call to exchange code for token...')
    let response
    if (provider.value === 'GitHub') {
      console.log('🔄 Calling GitHub connect API...')
      response = await apiService.connectGitHub(code, username.value)
    } else {
      console.log('🔄 Calling GitLab connect API...')
      response = await apiService.connectGitLab(code, username.value)
    }
    console.log('✅ API call successful, response:', response)

    statusMessage.value = `${provider.value} connected successfully!`
    success.value = true
    processing.value = false

    // Store connection data in sessionStorage for the claim page
    sessionStorage.setItem(`${provider.value.toLowerCase()}_auth_data`, JSON.stringify({
      connected: true,
      data: response[provider.value.toLowerCase()],
      timestamp: Date.now()
    }))

    // Redirect back to claim page after shorter delay
    setTimeout(() => {
      const redirectUrl = `/claim/${username.value}?oauth=${provider.value.toLowerCase()}_success`
      console.log('🚀 ATTEMPTING REDIRECT TO:', redirectUrl)
      console.log('🚀 Router object:', router)
      console.log('🚀 Current route before redirect:', route.path)

      router.push(redirectUrl).then(() => {
        console.log('✅ Router push successful')
      }).catch((error) => {
        console.error('❌ Router push failed:', error)
      })
    }, 1500)

  } catch (err: any) {
    console.error('💥 OAuth callback error occurred:')
    console.error('  Provider:', provider.value)
    console.error('  Error:', err)
    console.error('  Error message:', err?.message)
    console.error('  Error stack:', err?.stack)

    error.value = true
    processing.value = false
    errorMessage.value = err instanceof Error ? err.message : 'Authentication failed'
  }
}

const retry = () => {
  if (username.value && username.value !== 'unknown') {
    router.push(`/claim/${username.value}`)
  } else {
    router.push('/')
  }
}

const goHome = () => {
  router.push('/')
}

onMounted(() => {
  console.log('🎯 ALOHA AMIGOS THIS IS AUTH SCREEN')
  console.log('🎯 Current URL:', window.location.href)
  console.log('🎯 Route path:', route.path)
  console.log('🎯 Route query:', route.query)
  console.log('🎯 URL search params:', window.location.search)
  handleOAuthCallback()
})
</script>