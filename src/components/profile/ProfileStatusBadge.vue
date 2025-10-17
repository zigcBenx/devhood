<template>
  <div class="flex justify-center mt-6">
    <!-- Claimed Profile -->
    <div
      v-if="isClaimed"
      class="group flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-amber-500/20 to-orange-600/20 border border-amber-500/40 rounded-lg backdrop-blur-sm"
    >
      <Crown class="h-5 w-5 text-amber-400" />
      <span class="text-lg font-semibold text-amber-300">Profile Claimed</span>

      <div v-if="connections.length" class="flex items-center gap-2 text-sm">
        <span class="text-amber-300/70">Connected via:</span>
        <div class="flex gap-2">
          <Badge
            v-for="connection in connections"
            :key="connection.provider"
            variant="secondary"
            class="bg-amber-500/20 text-amber-200 border-amber-500/30"
          >
            {{ connection.provider }}
          </Badge>
        </div>
      </div>
    </div>

    <!-- Unclaimed Profile -->
    <button
      v-else
      @click="handleClaimClick"
      class="group flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-green-500/20 to-green-600/20 border border-green-500/40 rounded-lg hover:from-green-500/30 hover:to-green-600/30 hover:border-green-400 transition-all duration-300 hover:shadow-[0_0_25px_rgba(0,255,0,0.3)] backdrop-blur-sm"
    >
      <Crown class="h-5 w-5 text-yellow-400 group-hover:text-yellow-300 transition-colors" />
      <span class="text-lg font-semibold text-green-300 group-hover:text-green-200 transition-colors">
        Claim This Profile
      </span>
      <div class="flex gap-1">
        <div v-for="i in 3" :key="i" class="w-1 h-1 rounded-full bg-green-400 animate-pulse" :style="{ animationDelay: `${(i - 1) * 0.5}s` }" />
      </div>
    </button>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import Badge from '@/components/ui/badge.vue'
import { Crown } from 'lucide-vue-next'

interface Props {
  isClaimed?: boolean
  connections: Array<{ provider: string; username: string }>
  username: string
}

const props = withDefaults(defineProps<Props>(), {
  isClaimed: false
})
const router = useRouter()

const handleClaimClick = () => {
  router.push(`/claim/${props.username}`)
}
</script>
