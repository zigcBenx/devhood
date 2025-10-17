<template>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
    <Card
      v-for="(stat, index) in stats"
      :key="stat.label"
      :class="cardClasses"
      :style="{ animationDelay: `${index * 0.2}s` }"
    >
      <div class="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div class="absolute inset-0 bg-gradient-to-r from-transparent via-green-400/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />

      <div class="relative z-10">
        <div class="mb-6 relative">
          <component :is="getIcon(stat.icon)" :class="iconClasses" />
          <div class="absolute inset-0 bg-green-400/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        <p class="text-4xl font-black mb-3 text-green-300 group-hover:text-green-200 transition-colors duration-300 font-mono tracking-wider">
          {{ stat.value }}
        </p>

        <p class="text-lg text-green-400/80 group-hover:text-green-300 transition-colors duration-300 font-semibold tracking-wide uppercase">
          {{ stat.label }}
        </p>

        <div class="mt-4 flex justify-center">
          <div class="h-px w-16 bg-gradient-to-r from-transparent via-green-400 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      </div>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Card from '@/components/ui/card.vue'
import { Activity, GitBranch, Star, Code, GitCommit, Users, Calendar } from 'lucide-vue-next'

interface Stat {
  label: string
  value: string
  icon: string
}

interface Props {
  stats: Stat[]
}

const props = defineProps<Props>()

const cardClasses = computed(() =>
  'group relative p-8 text-center bg-gray-900/40 border border-green-500/30 backdrop-blur-sm hover:border-green-400 hover:bg-gray-800/60 transition-all duration-500 hover:shadow-[0_0_40px_rgba(0,255,0,0.2)] hover:scale-105 cursor-default overflow-hidden'
)

const iconClasses = computed(() =>
  'h-12 w-12 mx-auto text-green-400 group-hover:text-green-300 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6'
)

const iconMap = {
  Activity,
  GitBranch,
  Star,
  Code,
  GitCommit,
  Users,
  Calendar,
}

const getIcon = (iconName: string) => {
  return iconMap[iconName as keyof typeof iconMap] || Activity
}
</script>
