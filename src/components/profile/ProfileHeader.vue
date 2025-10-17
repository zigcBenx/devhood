<template>
  <div class="text-center mb-16 space-y-8">
    <!-- Avatar -->
    <div class="relative inline-block group">
      <Avatar
        :class="avatarClasses"
        :src="profile.avatar"
        :alt="profile.username"
        :fallback="profile.username.slice(0, 2).toUpperCase()"
      />
      <div class="absolute inset-0 bg-green-500/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>

    <!-- Name and Bio -->
    <div class="space-y-4">
      <h1 :class="titleClasses">
        {{ profile.displayName }}
      </h1>

      <div class="flex items-center justify-center gap-2 text-2xl text-green-300">
        <span class="text-green-500">@</span>
        <span class="font-semibold tracking-wider">{{ profile.username }}</span>
        <div class="w-2 h-6 bg-green-400 animate-pulse ml-1" />
      </div>

      <!-- Profile Status -->
      <ProfileStatusBadge
        :is-claimed="profileStatus?.claimed || false"
        :connections="profileStatus?.connections || []"
        :username="profile.username"
      />

      <p class="text-xl text-green-200/80 max-w-3xl mx-auto leading-relaxed font-light tracking-wide">
        {{ profile.bio }}
      </p>

      <!-- Location & Company -->
      <div v-if="profile.location || profile.company" class="flex items-center justify-center gap-6 text-green-400/70">
        <div v-if="profile.location" class="flex items-center gap-2">
          <MapPin class="h-4 w-4" />
          <span>{{ profile.location }}</span>
        </div>
        <div v-if="profile.company" class="flex items-center gap-2">
          <Building class="h-4 w-4" />
          <span>{{ profile.company }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Avatar from '@/components/ui/avatar.vue'
import ProfileStatusBadge from './ProfileStatusBadge.vue'
import { MapPin, Building } from 'lucide-vue-next'

interface Props {
  profile: {
    avatar: string
    username: string
    displayName: string
    bio: string
    location?: string
    company?: string
  }
  profileStatus?: {
    claimed: boolean
    connections: Array<{ provider: string; username: string }>
  } | null
}

const props = defineProps<Props>()

const avatarClasses = computed(() =>
  'h-40 w-40 mx-auto ring-4 ring-green-500/50 shadow-[0_0_30px_rgba(0,255,0,0.3)] transition-all duration-300 group-hover:ring-green-400 group-hover:shadow-[0_0_50px_rgba(0,255,0,0.5)]'
)

const titleClasses = computed(() =>
  'text-5xl md:text-6xl font-black mb-4 bg-gradient-to-r from-green-400 via-green-300 to-green-500 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(0,255,0,0.3)]'
)
</script>
