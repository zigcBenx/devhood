<template>
  <div class="min-h-screen bg-black text-green-400 font-mono overflow-hidden relative">
    <!-- Animated background grid -->
    <div class="absolute inset-0 bg-[linear-gradient(rgba(0,255,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.03)_1px,transparent_1px)] bg-[size:20px_20px] animate-pulse"></div>
    
    <div class="relative z-10 container mx-auto px-6 py-12 max-w-6xl">
      <!-- Hero Section -->
      <div class="text-center mb-16 space-y-8">
        <!-- Terminal-style header -->
        <div class="inline-block bg-gray-900/80 border border-green-500/30 rounded-lg p-4 mb-8 backdrop-blur-sm">
          <div class="flex items-center gap-2 mb-2">
            <div class="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
            <div class="w-3 h-3 rounded-full bg-yellow-500 animate-pulse" style="animation-delay: 0.5s"></div>
            <div class="w-3 h-3 rounded-full bg-green-500 animate-pulse" style="animation-delay: 1s"></div>
          </div>
          <div class="text-green-400 text-sm font-mono">$ whoami</div>
        </div>
        
        <!-- Avatar with glitch effect -->
        <div class="relative inline-block group">
          <Avatar 
            class="h-40 w-40 mx-auto ring-4 ring-green-500/50 shadow-[0_0_30px_rgba(0,255,0,0.3)] transition-all duration-300 group-hover:ring-green-400 group-hover:shadow-[0_0_50px_rgba(0,255,0,0.5)]"
            :src="profile.avatar"
            :alt="profile.username"
            :fallback="profile.username.slice(0, 2).toUpperCase()"
          />
          <div class="absolute inset-0 bg-green-500/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
        
        <!-- Name with terminal aesthetic -->
        <div class="space-y-4">
          <h1 class="text-6xl md:text-7xl font-black mb-4 bg-gradient-to-r from-green-400 via-green-300 to-green-500 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(0,255,0,0.3)] animate-pulse">
            {{ profile.displayName }}
          </h1>
          <div class="flex items-center justify-center gap-2 text-2xl text-green-300">
            <span class="text-green-500">@</span>
            <span class="font-semibold tracking-wider">{{ profile.username }}</span>
            <div class="w-2 h-6 bg-green-400 animate-pulse ml-1"></div>
          </div>
          <p class="text-xl text-green-200/80 max-w-3xl mx-auto leading-relaxed font-light tracking-wide">
            {{ profile.bio }}
          </p>
        </div>
      </div>

      <!-- Social Links -->
      <div class="flex justify-center gap-6 mb-16">
        <a
          v-for="link in profile.socialLinks"
          :key="link.platform"
          :href="link.url"
          target="_blank"
          rel="noopener noreferrer"
          class="group relative flex items-center gap-3 px-6 py-3 bg-gray-900/50 border border-green-500/30 rounded-lg hover:border-green-400 hover:bg-gray-800/70 transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,255,0,0.2)] backdrop-blur-sm"
        >
          <component :is="link.icon" class="h-6 w-6 text-green-400 group-hover:text-green-300 transition-all duration-300 group-hover:scale-110" />
          <span class="text-lg font-semibold text-green-300 group-hover:text-green-200 transition-colors">{{ link.platform }}</span>
          <div class="absolute inset-0 bg-green-500/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </a>
      </div>

      <!-- Achievement Badges -->
      <div class="mb-16">
        <h2 class="text-3xl font-bold mb-8 text-center text-green-400 tracking-wider">
          <span class="inline-block animate-pulse">[</span> ACHIEVEMENTS <span class="inline-block animate-pulse">]</span>
        </h2>
        <div class="flex justify-center gap-4 flex-wrap max-w-4xl mx-auto">
          <Badge
            v-for="(achievement, index) in profile.achievements"
            :key="achievement.name"
            variant="secondary"
            class="group relative px-6 py-3 text-base font-semibold bg-gray-900/60 border border-green-500/40 hover:border-green-400 transition-all duration-300 hover:shadow-[0_0_15px_rgba(0,255,0,0.3)] backdrop-blur-sm hover:scale-105 cursor-default"
            :style="{ animationDelay: `${index * 0.1}s` }"
          >
            <component :is="achievement.icon" class="h-5 w-5 mr-3 text-green-400 group-hover:text-green-300 transition-all duration-300 group-hover:rotate-12" />
            <span class="text-green-300 group-hover:text-green-200">{{ achievement.name }}</span>
            <div class="absolute inset-0 bg-green-500/5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </Badge>
        </div>
      </div>

      <!-- Activity Graph -->
      <Card class="mb-12 bg-gray-900/60 border-green-500/30 backdrop-blur-sm hover:border-green-400 transition-all duration-300 hover:shadow-[0_0_25px_rgba(0,255,0,0.1)]">
        <div class="p-8">
          <h2 class="text-2xl font-bold mb-6 text-green-400 tracking-wider flex items-center justify-center gap-2">
            <span class="text-green-500">&gt;</span> ACTIVITY MATRIX <span class="text-green-500">&lt;</span>
          </h2>
          <div class="h-40 rounded-lg bg-black/40 border border-green-500/20 flex items-center justify-center relative overflow-hidden group">
            <div class="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(0,255,0,0.1)_50%,transparent_100%)] translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-2000 ease-in-out"></div>
            <div class="text-center relative z-10">
              <Activity class="h-12 w-12 mx-auto mb-3 text-green-400 animate-pulse" />
              <p class="text-lg text-green-300 font-semibold">Neural Network Mapping</p>
              <p class="text-sm text-green-400/60 mt-2 font-mono">[ INITIALIZING MATRIX... ]</p>
            </div>
          </div>
        </div>
      </Card>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card
          v-for="(stat, index) in profile.stats"
          :key="stat.label"
          class="group relative p-8 text-center bg-gray-900/40 border border-green-500/30 backdrop-blur-sm hover:border-green-400 hover:bg-gray-800/60 transition-all duration-500 hover:shadow-[0_0_40px_rgba(0,255,0,0.2)] hover:scale-105 cursor-default overflow-hidden"
          :style="{ animationDelay: `${index * 0.2}s` }"
        >
          <!-- Animated background on hover -->
          <div class="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          <!-- Glowing border effect -->
          <div class="absolute inset-0 bg-gradient-to-r from-transparent via-green-400/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out"></div>
          
          <div class="relative z-10">
            <div class="mb-6 relative">
              <component :is="stat.icon" class="h-12 w-12 mx-auto text-green-400 group-hover:text-green-300 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6" />
              <div class="absolute inset-0 bg-green-400/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <p class="text-4xl font-black mb-3 text-green-300 group-hover:text-green-200 transition-colors duration-300 font-mono tracking-wider">{{ stat.value }}</p>
            <p class="text-lg text-green-400/80 group-hover:text-green-300 transition-colors duration-300 font-semibold tracking-wide uppercase">{{ stat.label }}</p>
            
            <!-- Terminal-style accent -->
            <div class="mt-4 flex justify-center">
              <div class="h-px w-16 bg-gradient-to-r from-transparent via-green-400 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import Avatar from '@/components/ui/avatar.vue'
import Badge from '@/components/ui/badge.vue'
import Card from '@/components/ui/card.vue'
import { 
  Github, 
  Globe, 
  Moon, 
  Calendar,
  Activity,
  GitCommit,
  Star,
  Users
} from 'lucide-vue-next'

interface Achievement {
  name: string
  icon: any
}

interface SocialLink {
  platform: string
  url: string
  icon: any
}

interface Stat {
  label: string
  value: string
  icon: any
}

interface Profile {
  username: string
  displayName: string
  bio: string
  avatar: string
  socialLinks: SocialLink[]
  achievements: Achievement[]
  stats: Stat[]
}

const profile = reactive<Profile>({
  username: 'developer',
  displayName: 'Jane Developer',
  bio: 'Full-stack developer passionate about creating elegant solutions. I love working with modern web technologies and contributing to open source projects.',
  avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop&crop=face',
  socialLinks: [
    {
      platform: 'GitHub',
      url: 'https://github.com/developer',
      icon: Github
    },
    {
      platform: 'Website',
      url: 'https://developer.dev',
      icon: Globe
    }
  ],
  achievements: [
    {
      name: 'Night Owl',
      icon: Moon
    },
    {
      name: 'Weekend Warrior',
      icon: Calendar
    }
  ],
  stats: [
    {
      label: 'Contributions',
      value: '1,247',
      icon: GitCommit
    },
    {
      label: 'Stars Earned',
      value: '342',
      icon: Star
    },
    {
      label: 'Followers',
      value: '89',
      icon: Users
    }
  ]
})
</script>