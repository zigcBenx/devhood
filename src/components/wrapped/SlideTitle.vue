<script setup lang="ts">
import { ref, watch } from 'vue';

interface Props {
  text: string;
  animation?: 'fade' | 'slide' | 'scale';
  delay?: number;
  duration?: number;
  isActive?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  animation: 'fade',
  delay: 0,
  duration: 3000,
  isActive: false
});

const isVisible = ref(false);

watch(() => props.isActive, async (newVal) => {
  if (newVal) {
    if (props.delay > 0) {
      await new Promise(resolve => setTimeout(resolve, props.delay));
    }
    isVisible.value = true;
  } else {
    isVisible.value = false;
  }
}, { immediate: true });
</script>

<template>
  <h2 
    v-if="isVisible"
    class="slide-title text-5xl md:text-7xl font-black tracking-tighter text-green-500 drop-shadow-[0_0_10px_rgba(34,197,94,0.5)] font-mono"
    :class="{
      'animate-fade-in-slow': animation === 'fade',
      'animate-slide-in-left': animation === 'slide',
      'animate-scale-in': animation === 'scale'
    }"
    :style="{ animationDuration: `${duration}ms` }"
  >
    {{ text }}
  </h2>
</template>

<style scoped>
.animate-fade-in-slow {
  animation: fadeIn ease-out forwards;
  opacity: 0;
}

.animate-slide-in-left {
  animation: slideInLeft 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  opacity: 0;
}

.animate-scale-in {
  animation: scaleIn 0.6s ease-out forwards;
  opacity: 0;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideInLeft {
  from { opacity: 0; transform: translateX(-50px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}
</style>
