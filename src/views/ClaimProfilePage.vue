<template>
  <div class="min-h-screen bg-black text-green-400 font-mono overflow-hidden relative">
    <!-- Animated background grid -->
    <div class="absolute inset-0 bg-[linear-gradient(rgba(0,255,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.03)_1px,transparent_1px)] bg-[size:20px_20px] animate-pulse"></div>

    <div class="relative z-10">
      <!-- Header -->
      <div class="border-b border-green-500/20 bg-gray-900/50 backdrop-blur-sm">
        <div class="container mx-auto px-6 py-4 flex items-center justify-between">
          <div class="flex items-center gap-4">
            <button
              @click="$router.push(`/${username}`)"
              class="text-green-400 hover:text-green-300 transition-colors"
            >
              ← Back to Profile
            </button>
            <h1 class="text-xl font-bold">Claim Your Profile</h1>
          </div>
          <div class="text-sm text-green-300/60">
            @{{ username }}
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="container mx-auto px-6 py-12 max-w-2xl">
        <!-- Error Message -->
        <div v-if="error" class="mb-8 bg-red-900/20 border border-red-500/40 rounded-lg p-4">
          <div class="flex items-center gap-3">
            <div class="text-red-400">⚠️</div>
            <div>
              <div class="font-semibold text-red-400">Error</div>
              <div class="text-red-300/80 text-sm">{{ error }}</div>
            </div>
            <button
              @click="error = null"
              class="ml-auto text-red-400 hover:text-red-300 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
        <!-- Progress Indicator -->
        <div class="mb-12">
          <div class="flex items-center justify-between mb-4">
            <span class="text-sm text-green-300/60">Step {{ currentStep }} of {{ totalSteps }}</span>
            <span class="text-sm text-green-300/60">{{ Math.round((currentStep / totalSteps) * 100) }}% Complete</span>
          </div>
          <div class="w-full bg-gray-800 rounded-full h-2">
            <div
              class="bg-green-500 h-2 rounded-full transition-all duration-500"
              :style="{ width: `${(currentStep / totalSteps) * 100}%` }"
            ></div>
          </div>
        </div>

        <!-- Step Content -->
        <div class="space-y-8">
          <!-- Step 1: GitHub Authentication -->
          <div class="step-container" :class="{ active: currentStep === 1, completed: currentStep > 1 }">
            <div class="flex items-start gap-4 mb-6">
              <div class="step-indicator">
                <span v-if="currentStep > 1">✓</span>
                <span v-else>1</span>
              </div>
              <div class="flex-1">
                <h2 class="text-2xl font-bold mb-2">Connect GitHub</h2>
                <p class="text-green-300/80 mb-6">
                  Authenticate with GitHub to access your repositories and contribution data.
                </p>
              </div>
            </div>

            <div v-if="currentStep === 1" class="step-content">
              <div class="bg-gray-900/50 border border-green-500/20 rounded-lg p-6">
                <div class="flex items-center gap-4 mb-4">
                  <div class="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center">
                    <svg class="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 class="font-semibold">GitHub Authentication</h3>
                    <p class="text-sm text-green-300/60">Required to access your repository data</p>
                  </div>
                </div>

                <div v-if="!githubConnected" class="space-y-4">
                  <button
                    @click="connectGitHub"
                    :disabled="githubConnecting"
                    class="w-full bg-green-500 text-black py-3 px-6 rounded-lg font-semibold hover:bg-green-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span v-if="githubConnecting">Connecting...</span>
                    <span v-else>Connect GitHub Account</span>
                  </button>
                  <p class="text-xs text-green-300/40 text-center">
                    We'll only access public repository data
                  </p>
                </div>

                <div v-else class="text-center py-4">
                  <div class="text-green-400 mb-2">✓ GitHub Connected</div>
                  <p class="text-sm text-green-300/60">Successfully connected to GitHub</p>
                  <button
                    @click="nextStep"
                    class="mt-4 bg-green-500 text-black py-2 px-6 rounded-lg font-semibold hover:bg-green-400 transition-colors"
                  >
                    Continue to GitLab
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Step 2: GitLab Authentication -->
          <div class="step-container" :class="{ active: currentStep === 2, completed: currentStep > 2 }">
            <div class="flex items-start gap-4 mb-6">
              <div class="step-indicator">
                <span v-if="currentStep > 2">✓</span>
                <span v-else>2</span>
              </div>
              <div class="flex-1">
                <h2 class="text-2xl font-bold mb-2">Connect GitLab</h2>
                <p class="text-green-300/80 mb-6">
                  Authenticate with GitLab to access your projects and contribution data.
                </p>
              </div>
            </div>

            <div v-if="currentStep === 2" class="step-content">
              <div class="bg-gray-900/50 border border-green-500/20 rounded-lg p-6">
                <div class="flex items-center gap-4 mb-4">
                  <div class="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center">
                    <svg class="w-6 h-6 text-orange-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.955 13.587l-1.342-4.135-2.664-8.189c-.135-.423-.73-.423-.867 0L16.418 9.45H7.582L4.919 1.263c-.135-.423-.73-.423-.867 0L1.388 9.452L.046 13.587c-.121.375.014.789.331 1.023L12 23.054l11.623-8.443c.318-.235.453-.648.332-1.024"/>
                    </svg>
                  </div>
                  <div>
                    <h3 class="font-semibold">GitLab Authentication</h3>
                    <p class="text-sm text-green-300/60">Optional: Connect to combine contribution data</p>
                  </div>
                </div>

                <div v-if="!gitlabConnected" class="space-y-4">
                  <button
                    @click="connectGitLab"
                    :disabled="gitlabConnecting"
                    class="w-full bg-orange-500 text-black py-3 px-6 rounded-lg font-semibold hover:bg-orange-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span v-if="gitlabConnecting">Connecting...</span>
                    <span v-else>Connect GitLab Account</span>
                  </button>
                  <button
                    @click="skipGitLab"
                    class="w-full border border-green-500/30 text-green-400 py-2 px-6 rounded-lg hover:border-green-400 transition-colors"
                  >
                    Skip GitLab (GitHub Only)
                  </button>
                  <p class="text-xs text-green-300/40 text-center">
                    GitLab connection is optional but recommended for complete profile
                  </p>
                </div>

                <div v-else class="text-center py-4">
                  <div class="text-orange-400 mb-2">✓ GitLab Connected</div>
                  <p class="text-sm text-green-300/60">Successfully connected to GitLab</p>
                  <button
                    @click="nextStep"
                    class="mt-4 bg-green-500 text-black py-2 px-6 rounded-lg font-semibold hover:bg-green-400 transition-colors"
                  >
                    Continue to Customization
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Step 3: Profile Customization -->
          <div class="step-container" :class="{ active: currentStep === 3, completed: currentStep > 3 }">
            <div class="flex items-start gap-4 mb-6">
              <div class="step-indicator">
                <span v-if="currentStep > 3">✓</span>
                <span v-else>3</span>
              </div>
              <div class="flex-1">
                <h2 class="text-2xl font-bold mb-2">Customize Your Profile</h2>
                <p class="text-green-300/80 mb-6">
                  Personalize how your profile appears and configure your contribution heatmap.
                </p>
              </div>
            </div>

            <div v-if="currentStep === 3" class="step-content">
              <ProfileCustomization
                :github-connected="githubConnected"
                :gitlab-connected="gitlabConnected"
                v-model:settings="profileSettings"
                @complete="completeCustomization"
              />
            </div>
          </div>

          <!-- Step 4: Generate Profile Assets -->
          <div class="step-container" :class="{ active: currentStep === 4, completed: currentStep > 4 }">
            <div class="flex items-start gap-4 mb-6">
              <div class="step-indicator">
                <span v-if="currentStep > 4">✓</span>
                <span v-else>4</span>
              </div>
              <div class="flex-1">
                <h2 class="text-2xl font-bold mb-2">Generate Profile Assets</h2>
                <p class="text-green-300/80 mb-6">
                  Create shareable images and assets for your GitHub profile README.
                </p>
              </div>
            </div>

            <div v-if="currentStep === 4" class="step-content">
              <ProfileAssetGenerator
                :username="username"
                :settings="profileSettings"
                @complete="completeSetup"
              />
            </div>
          </div>
        </div>

        <!-- Completion Message -->
        <div v-if="setupComplete" class="mt-12 text-center">
          <div class="bg-green-500/10 border border-green-500/30 rounded-lg p-8">
            <div class="text-4xl mb-4">🎉</div>
            <h2 class="text-2xl font-bold text-green-400 mb-4">Profile Claimed Successfully!</h2>
            <p class="text-green-300/80 mb-6">
              Your DevHood profile is now active with custom settings and connected accounts.
            </p>
            <div class="flex gap-4 justify-center">
              <button
                @click="$router.push(`/${username}`)"
                class="bg-green-500 text-black py-3 px-6 rounded-lg font-semibold hover:bg-green-400 transition-colors"
              >
                View My Profile
              </button>
              <button
                @click="$router.push('/')"
                class="border border-green-500/30 text-green-400 py-3 px-6 rounded-lg hover:border-green-400 transition-colors"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import ProfileCustomization from '@/components/ProfileCustomization.vue'
import ProfileAssetGenerator from '@/components/ProfileAssetGenerator.vue'
import { apiService } from '@/services/api'

const props = defineProps<{
  username: string
}>()

const route = useRoute()

const currentStep = ref(1)
const totalSteps = 4
const setupComplete = ref(false)

const githubConnected = ref(false)
const githubConnecting = ref(false)
const githubData = ref<any>(null)

const gitlabConnected = ref(false)
const gitlabConnecting = ref(false)
const gitlabData = ref<any>(null)

const error = ref<string | null>(null)

const profileSettings = ref({
  theme: 'dark',
  showPrivateContributions: false,
  heatmapStyle: 'github',
  combinedView: true,
  displayName: '',
  bio: '',
  location: '',
  website: ''
})

const connectGitHub = async () => {
  githubConnecting.value = true
  error.value = null

  try {
    // Get OAuth URL and redirect
    const { url } = await apiService.getGitHubOAuthUrl(props.username)
    console.log('Redirecting to GitHub OAuth URL:', url)
    window.location.href = url
  } catch (err) {
    console.error('GitHub OAuth URL error:', err)
    error.value = err instanceof Error ? err.message : 'Failed to connect to GitHub'
    githubConnecting.value = false
  }
}

const connectGitLab = async () => {
  gitlabConnecting.value = true
  error.value = null

  try {
    // Get OAuth URL and redirect
    const { url } = await apiService.getGitLabOAuthUrl(props.username)
    window.location.href = url
  } catch (err) {
    console.error('GitLab OAuth URL error:', err)
    error.value = err instanceof Error ? err.message : 'Failed to connect to GitLab'
    gitlabConnecting.value = false
  }
}


const skipGitLab = () => {
  nextStep()
}

const nextStep = () => {
  if (currentStep.value < totalSteps) {
    currentStep.value++
  }
}

const completeCustomization = async () => {
  try {
    // Save profile settings to backend
    await apiService.claimProfile(props.username, {
      settings: profileSettings.value,
      githubData: githubData.value,
      gitlabData: gitlabData.value
    })
    nextStep()
  } catch (err) {
    console.error('Profile claim error:', err)
    error.value = err instanceof Error ? err.message : 'Failed to save profile'
  }
}

const completeSetup = () => {
  setupComplete.value = true
}

onMounted(async () => {
  console.log('🏠 CLAIM PROFILE PAGE MOUNTED')
  console.log('🏠 Current URL:', window.location.href)
  console.log('🏠 Username prop:', props.username)
  console.log('🏠 Route params:', route.params)

  // Check for OAuth success parameter
  const urlParams = new URLSearchParams(window.location.search)
  const oauthSuccess = urlParams.get('oauth')
  if (oauthSuccess) {
    console.log(`🎉 OAuth success detected: ${oauthSuccess}`)
    // Clean up URL
    window.history.replaceState({}, document.title, window.location.pathname)
  } else {
    console.log('🔍 No OAuth success parameter found')
  }

  // Check for auth data from OAuth callback
  checkForAuthData()

  // Check existing profile status and connections
  try {
    const [status, connections] = await Promise.all([
      apiService.getProfileStatus(props.username),
      apiService.getConnections(props.username)
    ])

    if (status.claimed) {
      // Profile already claimed, maybe redirect or show different UI
      console.log('Profile already claimed:', status)
    }

    // Check for stored connections
    if (connections.connected) {
      console.log('Found stored connections:', connections)

      if (connections.github) {
        githubConnected.value = true
        githubData.value = connections.github
        console.log('GitHub already connected:', connections.github.login)

        // Auto advance from step 1 if on step 1, but only to step 2 (GitLab)
        if (currentStep.value === 1) {
          setTimeout(() => {
            currentStep.value = 2
            console.log('🎯 Advanced to GitLab step after GitHub connection')
          }, 1000)
        }
      }

      if (connections.gitlab) {
        gitlabConnected.value = true
        gitlabData.value = connections.gitlab
        console.log('GitLab already connected:', connections.gitlab.username)

        // Auto advance from step 2 if on step 2
        if (currentStep.value === 2) {
          setTimeout(() => nextStep(), 1000)
        }
      }
    }

    // Fallback to status check
    if (status.hasGitHub && !githubConnected.value) {
      githubConnected.value = true
    }

    if (status.hasGitLab && !gitlabConnected.value) {
      gitlabConnected.value = true
    }

  } catch (err) {
    console.error('Failed to check profile status or connections:', err)
  }
})

const checkForAuthData = () => {
  // Check for GitHub auth data
  const githubAuthData = sessionStorage.getItem('github_auth_data')
  if (githubAuthData) {
    try {
      const data = JSON.parse(githubAuthData)
      if (data.connected && data.timestamp > Date.now() - 300000) { // 5 minute expiry
        githubConnected.value = true
        githubData.value = data.data
        console.log('GitHub auth data found:', data.data)

        // Show success message
        setTimeout(() => {
          console.log('GitHub successfully connected! Advancing to next step...')
        }, 100)

        // Clean up
        sessionStorage.removeItem('github_auth_data')

        // Auto advance to step 2 (GitLab) if we're on step 1
        if (currentStep.value === 1) {
          setTimeout(() => {
            currentStep.value = 2
            console.log('🎯 GitHub auth complete, advancing to GitLab step')
          }, 500)
        }
      }
    } catch (e) {
      console.error('Failed to parse GitHub auth data:', e)
      sessionStorage.removeItem('github_auth_data')
    }
  }

  // Check for GitLab auth data
  const gitlabAuthData = sessionStorage.getItem('gitlab_auth_data')
  if (gitlabAuthData) {
    try {
      const data = JSON.parse(gitlabAuthData)
      if (data.connected && data.timestamp > Date.now() - 300000) { // 5 minute expiry
        gitlabConnected.value = true
        gitlabData.value = data.data
        console.log('GitLab auth data found:', data.data)

        // Clean up
        sessionStorage.removeItem('gitlab_auth_data')

        // Auto advance to next step if we're on step 2
        if (currentStep.value === 2) {
          setTimeout(() => nextStep(), 500) // Small delay for better UX
        }
      }
    } catch (e) {
      console.error('Failed to parse GitLab auth data:', e)
      sessionStorage.removeItem('gitlab_auth_data')
    }
  }
}
</script>

<style scoped>
.step-container {
  @apply opacity-50 pointer-events-none transition-all duration-300;
}

.step-container.active {
  @apply opacity-100 pointer-events-auto;
}

.step-container.completed {
  @apply opacity-75;
}

.step-indicator {
  @apply w-10 h-10 rounded-full border-2 border-green-500/30 flex items-center justify-center text-sm font-bold transition-colors;
}

.step-container.active .step-indicator {
  @apply bg-green-500 text-black border-green-500;
}

.step-container.completed .step-indicator {
  @apply bg-green-500 text-black border-green-500;
}

.step-content {
  @apply animate-fadeIn;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fadeIn {
  animation: fadeIn 0.5s ease-out;
}
</style>