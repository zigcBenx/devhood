<template>
  <div class="flex justify-center mb-8">
    <div class="inline-flex items-center gap-3 px-6 py-3 bg-gray-900/60 border border-green-500/30 rounded-lg backdrop-blur-sm">
      <div class="flex items-center gap-2 text-sm text-green-300">
        <Shield class="h-4 w-4 text-green-400" />
        <span class="font-semibold">Verified Profile</span>
      </div>
      
      <div class="w-px h-6 bg-green-500/30"></div>
      
      <div class="flex items-center gap-3">
        <div class="text-xs text-green-400/70">Connected:</div>
        
        <!-- GitHub -->
        <div v-if="providers.includes('github')" class="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/20 border border-green-500/40 rounded-md">
          <Github class="h-4 w-4 text-green-400" />
          <span class="text-green-300 text-sm font-medium">GitHub</span>
        </div>
        
        <!-- GitLab -->
        <div v-if="providers.includes('gitlab')" class="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/20 border border-blue-500/40 rounded-md">
          <div class="w-4 h-4 bg-blue-400 rounded text-[10px] flex items-center justify-center font-bold text-white">GL</div>
          <span class="text-blue-300 text-sm font-medium">GitLab</span>
        </div>
        
        <!-- Bitbucket (future) -->
        <div v-if="providers.includes('bitbucket')" class="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500/20 border border-orange-500/40 rounded-md">
          <div class="w-4 h-4 bg-orange-400 rounded text-[10px] flex items-center justify-center font-bold text-white">BB</div>
          <span class="text-orange-300 text-sm font-medium">Bitbucket</span>
        </div>
      </div>
      
      <!-- Stats Summary -->
      <div v-if="stats" class="w-px h-6 bg-green-500/30"></div>
      <div v-if="stats" class="flex items-center gap-4 text-xs">
        <div class="text-center">
          <div class="text-green-300 font-bold">{{ stats.totalRepos }}</div>
          <div class="text-green-400/60">repos</div>
        </div>
        <div class="text-center">
          <div class="text-green-300 font-bold">{{ stats.totalStars }}</div>
          <div class="text-green-400/60">stars</div>
        </div>
        <div class="text-center">
          <div class="text-green-300 font-bold">{{ stats.totalContributions }}</div>
          <div class="text-green-400/60">commits</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Github, Shield } from 'lucide-vue-next'

interface Props {
  providers: string[]
  stats?: {
    totalRepos: number
    totalStars: number
    totalContributions: number
  }
}

defineProps<Props>()
</script>