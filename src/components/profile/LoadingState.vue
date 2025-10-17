<template>
  <div class="flex items-center justify-center min-h-screen">
    <div class="text-center">
      <div :class="containerClasses">
        <div class="flex items-center gap-2 mb-4">
          <div
            v-for="i in 3"
            :key="i"
            class="w-3 h-3 rounded-full bg-green-500 animate-pulse"
            :style="{ animationDelay: `${(i - 1) * 0.5}s` }"
          />
        </div>
        <div class="text-green-400 text-lg font-mono mb-2">
          $ git fetch {{ username }}
        </div>
        <div class="text-green-300/60 text-sm">Loading developer profile...</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStyles } from '@/composables/useStyles'

interface Props {
  username: string
}

const props = defineProps<Props>()
const { classes, combine } = useStyles()

const containerClasses = computed(() =>
  combine('inline-block', classes.card, 'p-6')
)
</script>
