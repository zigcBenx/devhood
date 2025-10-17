<template>
  <div class="mb-16">
    <h2 class="text-3xl font-bold mb-8 text-center text-green-400 tracking-wider">
      <span class="inline-block animate-pulse">[</span>
      ACHIEVEMENTS
      <span class="inline-block animate-pulse">]</span>
    </h2>

    <BadgeDisplay v-if="badges.length" :badges="badges" />

    <!-- Legacy Achievement Display -->
    <div v-else-if="legacyAchievements.length" class="flex justify-center gap-4 flex-wrap max-w-4xl mx-auto">
      <Badge
        v-for="(achievement, index) in legacyAchievements"
        :key="achievement.name"
        variant="secondary"
        :class="badgeClasses"
        :style="{ animationDelay: `${index * 0.1}s` }"
      >
        <component :is="getIcon(achievement.icon)" :class="badgeIconClasses" />
        <span class="text-green-300 group-hover:text-green-200">{{ achievement.name }}</span>
        <div class="absolute inset-0 bg-green-500/5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </Badge>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Badge from '@/components/ui/badge.vue'
import BadgeDisplay from '@/components/BadgeDisplay.vue'
import { Shield, Star, Moon, Calendar, Activity, GitCommit, Users } from 'lucide-vue-next'

interface BadgeWithProgress {
  id: string
  name: string
  icon: string
  earned: boolean
}

interface Achievement {
  name: string
  icon: string
}

interface Props {
  badges: BadgeWithProgress[]
  legacyAchievements: Achievement[]
}

const props = defineProps<Props>()

const badgeClasses = computed(() =>
  'group relative px-6 py-3 text-base font-semibold bg-gray-900/60 border border-green-500/40 hover:border-green-400 transition-all duration-300 hover:shadow-[0_0_15px_rgba(0,255,0,0.3)] backdrop-blur-sm hover:scale-105 cursor-default'
)

const badgeIconClasses = computed(() =>
  'h-5 w-5 mr-3 text-green-400 group-hover:text-green-300 transition-all duration-300 group-hover:rotate-12'
)

const iconMap = {
  Shield,
  Star,
  Moon,
  Calendar,
  Activity,
  GitCommit,
  Users,
}

const getIcon = (iconName: string) => {
  return iconMap[iconName as keyof typeof iconMap] || Star
}
</script>
