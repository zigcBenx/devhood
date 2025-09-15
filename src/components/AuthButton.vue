<template>
  <div class="flex items-center gap-4">
    <!-- Login Button with Better UX -->
    <div v-if="!isAuthenticated && !isLoading" class="flex flex-col items-end gap-2">
      <button
        @click="login"
        class="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-black rounded-lg hover:from-green-400 hover:to-green-500 transition-all duration-300 font-semibold shadow-[0_0_20px_rgba(0,255,0,0.3)] hover:shadow-[0_0_30px_rgba(0,255,0,0.5)] transform hover:scale-105"
      >
        <Github class="h-5 w-5" />
        <span>Connect with GitHub</span>
      </button>
      <div class="text-xs text-green-400/70 font-mono text-right">
        → Claim profile & connect GitLab
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex items-center gap-2 px-6 py-3 bg-gray-900/60 border border-green-500/30 rounded-lg backdrop-blur-sm">
      <div class="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
      <span class="text-green-300">Authenticating...</span>
    </div>

    <!-- User Menu -->
    <div v-if="isAuthenticated && user" class="relative group">
      <button
        @click="showMenu = !showMenu"
        class="flex items-center gap-3 px-4 py-2 bg-gray-900/60 border border-green-500/30 rounded-lg hover:border-green-400 hover:bg-gray-800/70 transition-all duration-300 backdrop-blur-sm shadow-[0_0_15px_rgba(0,255,0,0.1)] hover:shadow-[0_0_25px_rgba(0,255,0,0.2)]"
      >
        <img 
          :src="user.picture" 
          :alt="user.name"
          class="w-8 h-8 rounded-full ring-2 ring-green-500/50"
        />
        <div class="text-left">
          <div class="text-green-300 text-sm font-semibold">{{ user.name }}</div>
          <div class="text-green-400/60 text-xs flex items-center gap-1">
            <div class="flex gap-1">
              <div class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span v-if="isGitLabConnected" class="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
            </div>
            {{ connectedProviders.length }} provider{{ connectedProviders.length !== 1 ? 's' : '' }} connected
          </div>
        </div>
        <ChevronDown class="h-4 w-4 text-green-400 transition-transform duration-200" :class="{ 'rotate-180': showMenu }" />
      </button>

      <!-- Minimalistic Dropdown Menu -->
      <div 
        v-if="showMenu"
        class="absolute right-0 top-full mt-2 w-72 bg-gray-900/95 border border-green-500/30 rounded-lg shadow-[0_0_30px_rgba(0,0,0,0.8)] backdrop-blur-sm z-50"
        @click="showMenu = false"
      >
        <!-- User Info -->
        <div class="p-3 border-b border-green-500/20">
          <div class="text-green-300 font-semibold text-sm">{{ user.name }}</div>
          <div class="text-green-400/60 text-xs">{{ user.email }}</div>
        </div>
        
        <div class="p-3 space-y-3">
          <!-- Profile Actions -->
          <div class="space-y-2">
            <button
              v-if="!profile?.is_claimed"
              @click="claimProfile"
              :disabled="claiming"
              class="w-full flex items-center gap-2 px-3 py-2 text-left bg-green-500/10 hover:bg-green-500/20 rounded-md transition-colors disabled:opacity-50 border border-green-500/20"
            >
              <Shield class="h-4 w-4 text-green-400" />
              <span class="text-green-300 font-medium">
                {{ claiming ? 'Claiming Profile...' : 'Claim This Profile' }}
              </span>
            </button>
            
            <button
              v-if="profile?.is_claimed"
              @click="syncData"
              :disabled="syncing"
              class="w-full flex items-center gap-2 px-3 py-2 text-left bg-green-500/10 hover:bg-green-500/20 rounded-md transition-colors disabled:opacity-50 border border-green-500/20"
            >
              <RefreshCw class="h-4 w-4 text-green-400" :class="{ 'animate-spin': syncing }" />
              <span class="text-green-300 font-medium">
                {{ syncing ? 'Syncing Data...' : 'Sync Data' }}
              </span>
            </button>
          </div>

          <!-- Integrations Section -->
          <div class="space-y-2">
            <div class="text-xs text-green-400/70 font-semibold uppercase tracking-wide">Integrations</div>
            
            <!-- GitHub (Always Connected) -->
            <div class="flex items-center justify-between px-3 py-2 bg-gray-800/50 rounded-md border border-green-500/10">
              <div class="flex items-center gap-2">
                <Github class="h-4 w-4 text-green-400" />
                <span class="text-green-300 text-sm font-medium">GitHub</span>
              </div>
              <div class="flex items-center gap-1">
                <div class="w-2 h-2 bg-green-400 rounded-full"></div>
                <span class="text-green-400/70 text-xs">Connected</span>
              </div>
            </div>
            
            <!-- GitLab -->
            <div class="flex items-center justify-between px-3 py-2 bg-gray-800/50 rounded-md border border-blue-500/10">
              <div class="flex items-center gap-2">
                <div class="w-4 h-4 bg-blue-400 rounded text-[10px] flex items-center justify-center font-bold text-white">GL</div>
                <span class="text-blue-300 text-sm font-medium">GitLab</span>
              </div>
              
              <button
                v-if="!isGitLabConnected"
                @click="linkAccount"
                class="px-2 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-xs font-medium rounded transition-colors"
              >
                Connect
              </button>
              
              <div v-else class="flex items-center gap-1">
                <div class="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span class="text-blue-400/70 text-xs">Connected</span>
              </div>
            </div>
          </div>
          
          <!-- Logout -->
          <div class="pt-2 border-t border-green-500/20">
            <button
              @click="logout"
              class="w-full flex items-center gap-2 px-3 py-2 text-left text-red-400/80 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
            >
              <LogOut class="h-4 w-4" />
              <span class="text-sm">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Overlay to close menu -->
    <div 
      v-if="showMenu"
      class="fixed inset-0 z-40"
      @click="showMenu = false"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useAuth0 } from '@auth0/auth0-vue'
import { supabaseService, supabase, type Profile } from '@/services/supabase'
import { Github, Shield, RefreshCw, Link, LogOut, ChevronDown } from 'lucide-vue-next'

const { loginWithRedirect, logout: auth0Logout, user, isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0()

const showMenu = ref(false)
const profile = ref<Profile | null>(null)
const claiming = ref(false)
const syncing = ref(false)

// Track connected providers
const connectedProviders = ref<string[]>([])

const isGitHubConnected = computed(() => connectedProviders.value.includes('github'))
const isGitLabConnected = computed(() => connectedProviders.value.includes('gitlab'))

const login = () => {
  // Store current path to redirect back after login
  const currentPath = window.location.pathname
  localStorage.setItem('auth_redirect_path', currentPath)
  
  loginWithRedirect({
    authorizationParams: {
      connection: 'github'
    }
  })
}

const logout = () => {
  auth0Logout({
    logoutParams: {
      returnTo: window.location.origin
    }
  })
}

const linkAccount = async () => {
  try {
    // Store current path to redirect back after GitLab connection
    const currentPath = window.location.pathname
    localStorage.setItem('auth_redirect_path', currentPath)
    
    // Try Auth0 GitLab connection
    await loginWithRedirect({
      authorizationParams: {
        connection: 'Gitlab',
        prompt: 'consent'
      }
    })
  } catch (error) {
    console.error('GitLab connection error:', error)
    // Show helpful error message
    alert(`GitLab connection failed. Please ensure:
    
1. GitLab connection is enabled in Auth0 Dashboard
2. Go to Auth0 → Authentication → Social → GitLab
3. Enable it and add your GitLab OAuth credentials
    
Error: ${(error as Error).message || 'Connection not configured'}`)
  }
}

const claimProfile = async () => {
  if (!user.value) return
  
  claiming.value = true
  try {
    // Get current profile username from URL
    const currentPath = window.location.pathname
    const currentUsername = currentPath.substring(1) // Remove leading slash
    
    // Create or update profile in Supabase
    const profileData = {
      auth0_id: user.value.sub,
      username: currentUsername || user.value.nickname || user.value.name?.toLowerCase().replace(/\s+/g, '') || 'user',
      display_name: user.value.name,
      email: user.value.email,
      avatar_url: user.value.picture,
      github_username: currentUsername, // Link to the GitHub profile being viewed
      is_claimed: true
    }

    // Check if profile already exists
    const existingProfile = await supabaseService.getProfileByAuth0Id(user.value.sub)
    
    if (existingProfile) {
      profile.value = await supabaseService.updateProfile(existingProfile.id, {
        ...profileData,
        username: existingProfile.username // Keep existing username if already set
      })
    } else {
      profile.value = await supabaseService.createProfile(profileData)
    }

    // Start data sync process
    if (profile.value) {
      syncData()
    }
  } catch (error) {
    console.error('Error claiming profile:', error)
  } finally {
    claiming.value = false
  }
}

const syncData = async () => {
  if (!profile.value) return
  
  syncing.value = true
  try {
    // Call Supabase Edge Function to sync data
    const { data, error } = await supabase.functions.invoke('sync-user-data', {
      body: {
        profileId: profile.value.id,
        providers: {
          github: { access_token: 'token_here' }, // This would come from Auth0
          gitlab: { access_token: 'token_here' }  // This would come from Auth0
        }
      }
    })

    if (error) throw error

    // Calculate badges
    await supabase.functions.invoke('calculate-badges', {
      body: {
        profileId: profile.value.id
      }
    })

    console.log('Data synced successfully:', data)
  } catch (error) {
    console.error('Error syncing data:', error)
  } finally {
    syncing.value = false
  }
}

const loadUserProfile = async () => {
  if (!user.value) return
  
  try {
    // Try to get existing profile
    let existingProfile = await supabaseService.getProfileByAuth0Id(user.value.sub)
    
    // If no profile exists, create one automatically
    if (!existingProfile) {
      const profileData = {
        auth0_id: user.value.sub,
        username: user.value.nickname || user.value.name?.toLowerCase().replace(/\s+/g, '') || 'user',
        display_name: user.value.name,
        email: user.value.email,
        avatar_url: user.value.picture,
        is_claimed: false // Not claimed yet, just connected
      }
      
      existingProfile = await supabaseService.createProfile(profileData)
    }
    
    profile.value = existingProfile
    
    // Sync provider accounts to database
    if (user.value.identities && existingProfile) {
      await syncProviderAccounts(existingProfile.id, user.value.identities)
    }
    
    // Detect connected providers from Auth0 user identities
    if (user.value.identities) {
      connectedProviders.value = user.value.identities.map((identity: any) => identity.provider)
    } else {
      // Fallback: assume GitHub is connected since they logged in
      connectedProviders.value = ['github']
    }
  } catch (error) {
    console.error('Error loading user profile:', error)
  }
}

const syncProviderAccounts = async (profileId: string, identities: any[]) => {
  try {
    for (const identity of identities) {
      // Check if provider account already exists
      const existingAccounts = await supabaseService.getProviderAccounts(profileId)
      const existingAccount = existingAccounts.find(acc => 
        acc.provider === identity.provider && acc.provider_account_id === identity.user_id
      )
      
      if (!existingAccount) {
        // Add new provider account
        await supabaseService.addProviderAccount({
          profile_id: profileId,
          provider: identity.provider,
          provider_account_id: identity.user_id,
          username: identity.provider === 'github' 
            ? (user.value?.nickname || identity.user_id)
            : identity.user_id,
          access_token_encrypted: identity.access_token ? btoa(identity.access_token) : undefined,
          scope: identity.scope
        })
      }
    }
  } catch (error) {
    console.error('Error syncing provider accounts:', error)
  }
}

// Watch for authentication changes
watch(isAuthenticated, (authenticated: boolean) => {
  if (authenticated) {
    loadUserProfile()
  } else {
    profile.value = null
  }
})

onMounted(() => {
  if (isAuthenticated.value) {
    loadUserProfile()
  }
})
</script>