<template>
  <div class="space-y-6">
    <!-- Badge Categories -->
    <div v-for="category in badgeCategories" :key="category.name" class="space-y-4">
      <h3 class="text-xl font-semibold text-green-400 flex items-center gap-2">
        <component :is="category.icon" class="h-5 w-5" />
        {{ category.name }}
      </h3>
      
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        <div
          v-for="badge in category.badges"
          :key="badge.id"
          class="group relative p-4 rounded-lg border transition-all duration-300 cursor-default"
          :class="[
            badge.earned 
              ? 'bg-gray-900/60 border-green-500/40 hover:border-green-400 hover:shadow-[0_0_15px_rgba(0,255,0,0.3)]' 
              : 'bg-gray-900/30 border-gray-600/30 hover:border-gray-500/50',
            getRarityClass(badge.rarity)
          ]"
        >
          <!-- Badge Icon -->
          <div class="flex flex-col items-center space-y-2">
            <div 
              class="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300"
              :class="badge.earned 
                ? 'bg-green-500/20 group-hover:bg-green-500/30' 
                : 'bg-gray-600/20 group-hover:bg-gray-500/30'"
            >
              <component 
                :is="getIcon(badge.icon)" 
                class="h-6 w-6 transition-all duration-300"
                :class="badge.earned 
                  ? 'text-green-400 group-hover:text-green-300 group-hover:scale-110' 
                  : 'text-gray-500 group-hover:text-gray-400'"
              />
            </div>
            
            <!-- Badge Name -->
            <h4 
              class="text-sm font-semibold text-center leading-tight transition-colors"
              :class="badge.earned ? 'text-green-300 group-hover:text-green-200' : 'text-gray-500'"
            >
              {{ badge.name }}
            </h4>
            
            <!-- Badge Description -->
            <p 
              class="text-xs text-center leading-tight transition-colors"
              :class="badge.earned ? 'text-green-400/70' : 'text-gray-600'"
            >
              {{ badge.description }}
            </p>
            
            <!-- Progress indicator for unearned badges -->
            <div v-if="!badge.earned && badge.progress" class="w-full mt-2">
              <div class="w-full bg-gray-700 rounded-full h-1.5">
                <div 
                  class="bg-green-500 h-1.5 rounded-full transition-all duration-300"
                  :style="{ width: `${Math.min(badge.progress, 100)}%` }"
                ></div>
              </div>
              <div class="text-xs text-gray-500 mt-1 text-center">
                {{ Math.floor(badge.progress) }}% complete
              </div>
            </div>
            
            <!-- Earned date -->
            <div v-if="badge.earned && badge.earnedAt" class="text-xs text-green-500/60 text-center">
              Earned {{ formatDate(badge.earnedAt) }}
            </div>
          </div>
          
          <!-- Rarity indicator -->
          <div 
            class="absolute top-2 right-2 w-2 h-2 rounded-full"
            :class="getRarityDotClass(badge.rarity)"
          ></div>
          
          <!-- Tooltip on hover -->
          <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 border border-green-500/30 rounded-lg text-xs text-green-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10 whitespace-nowrap">
            <div class="font-semibold">{{ badge.name }}</div>
            <div class="text-green-400/70">{{ badge.description }}</div>
            <div v-if="badge.rarity !== 'common'" class="text-green-500/60 capitalize">{{ badge.rarity }} Badge</div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Overall Progress -->
    <div class="bg-gray-900/40 border border-green-500/30 rounded-lg p-6 backdrop-blur-sm">
      <h3 class="text-xl font-semibold text-green-400 mb-4 flex items-center gap-2">
        <Trophy class="h-5 w-5" />
        Achievement Progress
      </h3>
      
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="text-center">
          <div class="text-2xl font-bold text-green-300">{{ earnedBadges.length }}</div>
          <div class="text-sm text-green-400/70">Badges Earned</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-green-300">{{ totalBadges }}</div>
          <div class="text-sm text-green-400/70">Total Badges</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-green-300">{{ Math.round(completionPercentage) }}%</div>
          <div class="text-sm text-green-400/70">Complete</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-green-300">{{ rareBadges }}</div>
          <div class="text-sm text-green-400/70">Rare+</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { 
  Moon, Calendar, Sunrise, GitCommit, Users, Star, Shield, 
  Code, Activity, Zap, Heart, Crown, Layers, Trophy, Flame 
} from 'lucide-vue-next'

interface Badge {
  id: string
  slug: string
  name: string
  description: string
  icon: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  earned: boolean
  earnedAt?: string
  progress?: number // 0-100 for unearned badges
}

interface Props {
  badges: Badge[]
}

const props = defineProps<Props>()

const iconMap = {
  Moon, Calendar, Sunrise, GitCommit, Users, Star, Shield, 
  Code, Activity, Zap, Heart, Crown, Layers, Trophy, Flame
}

const getIcon = (iconName: string) => {
  return iconMap[iconName as keyof typeof iconMap] || Star
}

const badgeCategories = computed(() => [
  {
    name: 'Productivity',
    icon: GitCommit,
    badges: props.badges.filter(b => 
      ['prolific', 'prolific-plus', 'streak-master', 'consistent', 'machine', 'unstoppable'].includes(b.slug) && b.earned
    )
  },
  {
    name: 'Social',
    icon: Users,
    badges: props.badges.filter(b => 
      ['popular', 'influencer', 'star-collector', 'star-legend'].includes(b.slug) && b.earned
    )
  },
  {
    name: 'Time & Habits',
    icon: Moon,
    badges: props.badges.filter(b => 
      ['night-owl', 'weekend-warrior', 'early-bird'].includes(b.slug) && b.earned
    )
  },
  {
    name: 'Experience',
    icon: Shield,
    badges: props.badges.filter(b => 
      ['veteran', 'pioneer'].includes(b.slug) && b.earned
    )
  },
  {
    name: 'Skills',
    icon: Code,
    badges: props.badges.filter(b => 
      ['polyglot', 'master-polyglot', 'architect'].includes(b.slug) && b.earned
    )
  },
  {
    name: 'Special',
    icon: Crown,
    badges: props.badges.filter(b => 
      ['open-source-hero', 'maintainer'].includes(b.slug) && b.earned
    )
  }
].filter(category => category.badges.length > 0))

const earnedBadges = computed(() => props.badges.filter(b => b.earned))

const totalBadges = computed(() => props.badges.length)

const completionPercentage = computed(() => 
  totalBadges.value > 0 ? (earnedBadges.value.length / totalBadges.value) * 100 : 0
)

const rareBadges = computed(() => 
  earnedBadges.value.filter(b => ['rare', 'epic', 'legendary'].includes(b.rarity)).length
)

const getRarityClass = (rarity: string) => {
  switch (rarity) {
    case 'rare':
      return 'hover:shadow-blue-500/20'
    case 'epic':
      return 'hover:shadow-purple-500/20'
    case 'legendary':
      return 'hover:shadow-yellow-500/20'
    default:
      return ''
  }
}

const getRarityDotClass = (rarity: string) => {
  switch (rarity) {
    case 'common':
      return 'bg-gray-400'
    case 'rare':
      return 'bg-blue-400'
    case 'epic':
      return 'bg-purple-400'
    case 'legendary':
      return 'bg-yellow-400'
    default:
      return 'bg-gray-400'
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
  })
}
</script>