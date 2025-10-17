<template>
  <div class="flex items-center justify-center min-h-screen">
    <div class="text-center max-w-md">
      <div :class="containerClasses">
        <div class="text-red-400 text-6xl mb-4">⚠️</div>
        <h2 class="text-2xl font-bold text-red-400 mb-4">Error 404</h2>
        <p class="text-red-300/80 mb-6">{{ error }}</p>

        <div class="flex gap-4 justify-center">
          <button @click="handleBack" :class="btnPrimaryClasses">
            ← Back Home
          </button>
          <button @click="handleRetry" :class="btnSecondaryClasses">
            Retry
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'

interface Props {
  error: string
}

interface Emits {
  (e: 'retry'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const router = useRouter()

const containerClasses = computed(() =>
  'bg-gray-900/80 border border-red-500/30 rounded-lg p-8 backdrop-blur-sm'
)

const btnPrimaryClasses = computed(() =>
  'px-4 py-2 bg-green-500 text-black rounded-md hover:bg-green-400 transition-colors font-semibold'
)

const btnSecondaryClasses = computed(() =>
  'px-4 py-2 bg-gray-700 text-green-400 border border-green-500/30 rounded-md hover:border-green-400 transition-colors font-semibold'
)

const handleBack = () => router.push('/')
const handleRetry = () => emit('retry')
</script>
