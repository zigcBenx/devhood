<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import WrappedSlide from './WrappedSlide.vue';

interface SlideData {
  title: string;
  subtitle?: string;
  stat?: string | number;
  statLabel?: string;
  description?: string;
  bgColor: string;
  image?: string;
}

const props = defineProps<{
  isOpen: boolean;
  slides: SlideData[];
}>();

const emit = defineEmits(['close']);

const currentIndex = ref(0);
const progress = ref(0);
let timer: number | null = null;
const SLIDE_DURATION = 5000; // 5 seconds per slide

const startTimer = () => {
  stopTimer();
  progress.value = 0;
  const startTime = Date.now();
  
  timer = window.setInterval(() => {
    const elapsed = Date.now() - startTime;
    progress.value = Math.min((elapsed / SLIDE_DURATION) * 100, 100);
    
    if (elapsed >= SLIDE_DURATION) {
      nextSlide();
    }
  }, 50);
};

const stopTimer = () => {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
};

const nextSlide = () => {
  if (currentIndex.value < props.slides.length - 1) {
    currentIndex.value++;
    startTimer();
  } else {
    close();
  }
};

const prevSlide = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--;
    startTimer();
  } else {
    // Reset current slide
    startTimer();
  }
};

const close = () => {
  stopTimer();
  emit('close');
  currentIndex.value = 0;
  progress.value = 0;
};

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    currentIndex.value = 0;
    startTimer();
  } else {
    stopTimer();
  }
});

onUnmounted(() => {
  stopTimer();
});
</script>

<template>
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 z-50 bg-black text-white flex flex-col md:flex-row">
      <!-- Mobile Close Button -->
      <button 
        @click="close" 
        class="absolute top-4 right-4 z-50 p-2 text-white/70 hover:text-white transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <!-- Main Content Area -->
      <div class="relative flex-1 h-full w-full overflow-hidden bg-gray-900">
        <!-- Progress Bars -->
        <div class="absolute top-0 left-0 right-0 z-50 flex gap-1 p-2">
          <div 
            v-for="(slide, index) in slides" 
            :key="index"
            class="h-1 flex-1 bg-white/20 rounded-full overflow-hidden"
          >
            <div 
              class="h-full bg-white transition-all duration-100 ease-linear"
              :style="{ 
                width: index < currentIndex ? '100%' : index === currentIndex ? `${progress}%` : '0%' 
              }"
            ></div>
          </div>
        </div>

        <!-- Slides -->
        <div class="relative w-full h-full">
          <WrappedSlide
            v-for="(slide, index) in slides"
            :key="index"
            v-bind="slide"
            :isActive="index === currentIndex"
          />
        </div>

        <!-- Navigation Tap Areas -->
        <div class="absolute inset-0 flex z-40">
          <div class="w-1/3 h-full" @click="prevSlide"></div>
          <div class="w-1/3 h-full" @click="nextSlide"></div> <!-- Center tap also goes next for simplicity, or could pause -->
          <div class="w-1/3 h-full" @click="nextSlide"></div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
