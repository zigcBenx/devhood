<template>
  <div class="bg-gray-900/60 border border-green-500/30 rounded-lg p-6 backdrop-blur-sm space-y-4">
    <h3 class="text-xl font-semibold text-green-400 flex items-center gap-2">
      <Share2 class="h-5 w-5" />
      Share Your Profile
    </h3>
    
    <p class="text-green-300/80">
      Show off your developer achievements and activity to the world.
    </p>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Quick Share -->
      <button
        @click="shareProfile"
        class="flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-black rounded-lg hover:bg-green-400 transition-all duration-300 font-semibold shadow-[0_0_15px_rgba(0,255,0,0.2)] hover:shadow-[0_0_25px_rgba(0,255,0,0.4)]"
      >
        <Share2 class="h-4 w-4" />
        Share Profile
      </button>
      
      <!-- Copy Link -->
      <button
        @click="copyLink"
        :disabled="copying"
        class="flex items-center justify-center gap-2 px-4 py-3 bg-gray-700 text-green-400 border border-green-500/30 rounded-lg hover:border-green-400 hover:bg-gray-600 transition-all duration-300 font-semibold disabled:opacity-50"
      >
        <component :is="copying ? Check : Copy" class="h-4 w-4" />
        <span v-if="copying">Copied!</span>
        <span v-else>Copy Link</span>
      </button>
    </div>
    
    <!-- Social Preview -->
    <div class="border border-green-500/20 rounded-lg p-4 bg-gray-800/30">
      <div class="text-sm text-green-400/70 mb-2">Social Media Preview</div>
      <div class="space-y-2">
        <div class="flex items-center gap-3">
          <img 
            :src="profile?.avatar_url" 
            :alt="profile?.username"
            class="w-12 h-12 rounded-lg"
          />
          <div>
            <div class="font-semibold text-green-300">{{ profile?.display_name }}</div>
            <div class="text-sm text-green-400/70">Developer Profile • DevHood</div>
          </div>
        </div>
        <div class="text-sm text-green-300/80">
          {{ profile?.bio || 'Check out my developer profile and achievements' }}
        </div>
      </div>
    </div>
    
    <!-- Share Analytics (if available) -->
    <div v-if="shareStats" class="grid grid-cols-3 gap-4 pt-4 border-t border-green-500/20">
      <div class="text-center">
        <div class="text-lg font-semibold text-green-300">{{ shareStats.views }}</div>
        <div class="text-xs text-green-400/70">Profile Views</div>
      </div>
      <div class="text-center">
        <div class="text-lg font-semibold text-green-300">{{ shareStats.shares }}</div>
        <div class="text-xs text-green-400/70">Times Shared</div>
      </div>
      <div class="text-center">
        <div class="text-lg font-semibold text-green-300">{{ shareStats.clicks }}</div>
        <div class="text-xs text-green-400/70">Link Clicks</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Share2, Copy, Check } from 'lucide-vue-next'
import type { Profile } from '@/services/supabase'

interface Props {
  profile: Profile
  shareStats?: {
    views: number
    shares: number
    clicks: number
  }
}

const props = defineProps<Props>()

const copying = ref(false)

const shareProfile = async () => {
  const url = window.location.href
  const title = `Check out ${props.profile.display_name}'s developer profile`
  const text = props.profile.bio || `${props.profile.display_name}'s achievements and coding activity`
  
  if (navigator.share) {
    try {
      await navigator.share({
        title,
        text,
        url
      })
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        copyLink()
      }
    }
  } else {
    copyLink()
  }
}

const copyLink = async () => {
  copying.value = true
  try {
    await navigator.clipboard.writeText(window.location.href)
    setTimeout(() => {
      copying.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy URL:', err)
    copying.value = false
  }
}
</script>