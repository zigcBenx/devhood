<template>
  <Card class="mb-12 bg-gray-900/60 border-green-500/30 backdrop-blur-sm hover:border-green-400 transition-all duration-300 hover:shadow-[0_0_25px_rgba(0,255,0,0.1)]">
    <div class="p-8">
      <h2 class="text-2xl font-bold mb-6 text-green-400 tracking-wider flex items-center justify-center gap-2">
        <span class="text-green-500">&gt;</span> ACTIVITY MATRIX <span class="text-green-500">&lt;</span>
      </h2>
      
      <!-- Loading State -->
      <div v-if="loading" class="bg-black/40 border border-green-500/20 rounded-lg p-8 relative overflow-hidden">
        <div class="text-center">
          <Activity class="h-12 w-12 mx-auto mb-3 text-green-400 animate-pulse" />
          <p class="text-lg text-green-300 font-semibold">Loading contribution matrix...</p>
          <p class="text-sm text-green-400/60 mt-2 font-mono">[ FETCHING DATA... ]</p>
        </div>
      </div>
      
      <!-- Error State -->
      <div v-else-if="error" class="bg-black/40 border border-red-500/30 rounded-lg p-8">
        <div class="text-center">
          <div class="text-red-400 text-4xl mb-3">⚠️</div>
          <p class="text-lg text-red-300 font-semibold mb-2">Failed to load activity matrix</p>
          <p class="text-sm text-red-400/80 font-mono">{{ error }}</p>
          <button
            @click="$emit('retry')"
            class="mt-4 px-4 py-2 bg-green-500 text-black rounded-md hover:bg-green-400 transition-colors font-semibold text-sm"
          >
            Retry
          </button>
        </div>
      </div>
      
      <!-- Contribution Grid -->
      <div v-else-if="displayedData" class="activity-container bg-black/40 border border-green-500/20 rounded-lg p-6 relative overflow-hidden group">
        <div class="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(0,255,0,0.1)_50%,transparent_100%)] translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-2000 ease-in-out"></div>
        
        <div class="relative z-10">
          <!-- Grid Header with Provider Toggles -->
          <div class="flex items-center justify-between mb-6">
            <div class="text-sm text-green-300 font-mono">
              <span class="text-green-500">$</span> git log --oneline --since="1 year ago"
            </div>
            
            <!-- Provider Toggles -->
            <div v-if="isMergedData" class="flex items-center gap-4">
              <div class="flex items-center gap-2 px-3 py-1 bg-gray-800/60 rounded-lg border border-green-500/20">
                <span class="text-xs text-green-400/70 font-mono">VIEW:</span>
                <button
                  @click="activeView = 'merged'"
                  class="px-2 py-1 text-xs font-semibold rounded transition-all duration-200"
                  :class="activeView === 'merged' 
                    ? 'bg-green-500/20 text-green-300 border border-green-500/40' 
                    : 'text-green-400/60 hover:text-green-300'"
                >
                  MERGED
                </button>
                <button
                  @click="activeView = 'github'"
                  class="px-2 py-1 text-xs font-semibold rounded transition-all duration-200 flex items-center gap-1"
                  :class="activeView === 'github' 
                    ? 'bg-green-500/20 text-green-300 border border-green-500/40' 
                    : 'text-green-400/60 hover:text-green-300'"
                >
                  <Github class="h-3 w-3" />
                  GITHUB
                </button>
                <button
                  @click="activeView = 'gitlab'"
                  class="px-2 py-1 text-xs font-semibold rounded transition-all duration-200 flex items-center gap-1"
                  :class="activeView === 'gitlab' 
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40' 
                    : 'text-green-400/60 hover:text-green-300'"
                >
                  <div class="w-3 h-3 bg-blue-400 rounded text-[8px] flex items-center justify-center font-bold text-white">GL</div>
                  GITLAB
                </button>
              </div>
            </div>
            
            <div class="flex flex-col items-end">
              <div class="text-xs text-green-400/60 font-mono">
                {{ displayedContributions.toLocaleString() }} CONTRIBUTIONS
              </div>
              <div v-if="activeView === 'merged' && isMergedData" class="text-xs text-green-300/60 font-mono mt-1">
                GITHUB + GITLAB
              </div>
              <div v-else-if="activeView === 'github'" class="text-xs text-green-300/60 font-mono mt-1">
                GITHUB ONLY
              </div>
              <div v-else-if="activeView === 'gitlab'" class="text-xs text-blue-300/60 font-mono mt-1">
                GITLAB ONLY
              </div>
              <div v-if="!hasGitHubToken" class="text-xs text-yellow-400/80 font-mono mt-1">
                SIMULATED DATA
              </div>
            </div>
          </div>
          
          <!-- Month Labels -->
          <div class="flex justify-between text-xs text-green-400/60 font-mono mb-2 pl-8">
            <span v-for="month in monthLabels" :key="month" class="flex-1 text-center">
              {{ month }}
            </span>
          </div>
          
          <!-- Day Labels + Contribution Grid -->
          <div class="flex gap-3">
            <!-- Day of week labels -->
            <div class="flex flex-col gap-1 text-xs text-green-400/60 font-mono pt-1">
              <div class="h-3 flex items-center">Mon</div>
              <div class="h-3"></div>
              <div class="h-3 flex items-center">Wed</div>
              <div class="h-3"></div>
              <div class="h-3 flex items-center">Fri</div>
              <div class="h-3"></div>
              <div class="h-3 flex items-center">Sun</div>
            </div>
            
            <!-- Contribution squares -->
            <div class="overflow-x-auto flex-1">
              <div class="flex gap-1 min-w-[800px]">
                <div 
                  v-for="(week, weekIndex) in displayedData.weeks" 
                  :key="weekIndex"
                  class="flex flex-col gap-1"
                >
                  <div
                    v-for="(day, dayIndex) in week.contributionDays"
                    :key="dayIndex"
                    class="w-3 h-3 rounded-sm transition-all duration-300 hover:scale-125 cursor-pointer border"
                    :class="[
                      day.color,
                      day.intensity > 0 ? 'hover:border-green-400 animate-pulse' : 'hover:border-green-500/40'
                    ]"
                    :style="{ 
                      animationDelay: `${(weekIndex * 7 + dayIndex) * 3}ms`,
                      animationDuration: day.intensity > 0 ? '2s' : '0s'
                    }"
                    @mouseenter="showTooltip(day, $event)"
                    @mousemove="updateTooltipPosition"
                    @mouseleave="hideTooltip"
                  ></div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Legend -->
          <div class="flex items-center justify-between text-xs mt-6">
            <div class="text-green-400/60 font-mono">Less</div>
            <div class="flex items-center gap-1">
              <div class="w-3 h-3 bg-gray-800 border border-green-500/20 rounded-sm"></div>
              <div class="w-3 h-3 bg-green-500/20 border border-green-500/30 rounded-sm"></div>
              <div class="w-3 h-3 bg-green-500/40 border border-green-500/50 rounded-sm"></div>
              <div class="w-3 h-3 bg-green-500/60 border border-green-500/70 rounded-sm"></div>
              <div class="w-3 h-3 bg-green-500/80 border border-green-500 rounded-sm"></div>
            </div>
            <div class="text-green-400/60 font-mono">More</div>
          </div>
        </div>
        
        <!-- Tooltip -->
        <div
          v-if="tooltip.show"
          class="absolute z-50 bg-gray-900 border border-green-500/50 rounded-lg px-3 py-2 text-sm text-green-300 font-mono shadow-lg pointer-events-none backdrop-blur-sm"
          :style="{ 
            left: tooltip.x + 'px', 
            top: tooltip.y + 'px',
            transform: 'translate(-50%, calc(-100% - 8px))'
          }"
        >
          {{ tooltip.text }}
          <div class="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
            <div class="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-green-500/50"></div>
          </div>
        </div>
      </div>
    </div>
  </Card>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { contributionsService, type ContributionsData, type ContributionDay } from '@/services/contributions'
import Card from '@/components/ui/card.vue'
import { Activity, Github } from 'lucide-vue-next'

interface Props {
  username: string
  mergedData?: {
    github?: ContributionsData
    gitlab?: ContributionsData
    merged?: ContributionsData
  }
  isClaimed?: boolean
}

const props = defineProps<Props>()

const loading = ref(false)
const error = ref('')
const contributionsData = ref<ContributionsData | null>(null)
const activeView = ref<'merged' | 'github' | 'gitlab'>('merged')

// Check if GitHub token is available
const hasGitHubToken = computed(() => {
  return !!((import.meta as any).env?.VITE_GITHUB_TOKEN)
})

// Check if this is merged data from a claimed profile
const isMergedData = computed(() => {
  return props.isClaimed && props.mergedData && 
    (props.mergedData.github || props.mergedData.gitlab)
})

// Get the currently displayed contributions based on active view
const displayedData = computed(() => {
  if (isMergedData.value && props.mergedData) {
    switch (activeView.value) {
      case 'merged':
        return props.mergedData.merged || props.mergedData.github || contributionsData.value
      case 'github':
        return props.mergedData.github || contributionsData.value
      case 'gitlab':
        return props.mergedData.gitlab || null
      default:
        return contributionsData.value
    }
  }
  return contributionsData.value
})

// Get total contributions for the current view
const displayedContributions = computed(() => {
  const data = displayedData.value
  return data?.totalContributions || 0
})

// Tooltip state
const tooltip = ref({
  show: false,
  x: 0,
  y: 0,
  text: ''
})

// Month labels for display
const monthLabels = computed(() => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const currentMonth = new Date().getMonth()
  const result = []
  
  // Show every 3rd month starting from current month - 11
  for (let i = 0; i < 4; i++) {
    const monthIndex = (currentMonth - 11 + (i * 3) + 12) % 12
    result.push(months[monthIndex])
  }
  
  return result
})

const fetchContributions = async () => {
  if (!props.username) return
  
  loading.value = true
  error.value = ''
  
  try {
    contributionsData.value = await contributionsService.fetchContributions(props.username)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load contributions'
    contributionsData.value = null
  } finally {
    loading.value = false
  }
}

const showTooltip = (day: ContributionDay, event: MouseEvent) => {
  const target = event.target as HTMLElement
  const container = target.closest('.activity-container') as HTMLElement
  const containerRect = container?.getBoundingClientRect()
  const targetRect = target.getBoundingClientRect()
  
  if (containerRect) {
    tooltip.value = {
      show: true,
      x: targetRect.left - containerRect.left + (targetRect.width / 2),
      y: targetRect.top - containerRect.top,
      text: contributionsService.formatTooltip(day)
    }
  }
}

const updateTooltipPosition = (event: MouseEvent) => {
  if (tooltip.value.show) {
    const target = event.target as HTMLElement
    const container = target.closest('.activity-container') as HTMLElement
    const containerRect = container?.getBoundingClientRect()
    const targetRect = target.getBoundingClientRect()
    
    if (containerRect) {
      tooltip.value.x = targetRect.left - containerRect.left + (targetRect.width / 2)
      tooltip.value.y = targetRect.top - containerRect.top
    }
  }
}

const hideTooltip = () => {
  tooltip.value.show = false
}

onMounted(() => {
  fetchContributions()
})

defineEmits<{
  retry: []
}>()
</script>