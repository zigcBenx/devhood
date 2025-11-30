<script setup lang="ts">
import { ref, watch } from 'vue';

interface Props {
  content: string;
  delay?: number;
  animation?: 'scale' | 'fade' | 'slide';
  isActive?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  delay: 0,
  animation: 'scale',
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
  <div 
    v-if="isVisible"
    class="reveal-box"
    :class="{
      'animate-scale-up': animation === 'scale',
      'animate-fade-in': animation === 'fade',
      'animate-slide-up': animation === 'slide'
    }"
  >
    <div class="box-content inline-block p-6 border-2 border-green-500 rounded-lg bg-black/80 shadow-[0_0_30px_rgba(34,197,94,0.4)] transform rotate-1">
      <div class="text-sm text-green-500/60 mb-2 uppercase tracking-widest">Commit Hash: 8badf00d</div>
      <div class="text-4xl md:text-6xl font-black text-white italic">"{{ content }}"</div>
    </div>
  </div>
</template>

<style scoped>
.animate-scale-up {
  animation: scaleUp 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  opacity: 0;
}

.animate-fade-in {
  animation: fadeIn 1s ease-out forwards;
  opacity: 0;
}

.animate-slide-up {
  animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  opacity: 0;
}

@keyframes scaleUp {
  from { opacity: 0; transform: scale(0.5); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
