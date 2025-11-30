<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue';
import WrappedSlide from './WrappedSlide.vue';

interface SlideData {
  title: string;
  subtitle?: string;
  stat?: string | number;
  statLabel?: string;
  description?: string;
  bgColor: string;
  image?: string;
  bgEffect?: 'contributions' | 'stars' | 'code' | 'confetti' | 'pulse' | 'rockets' | 'network' | 'none';
  listItems?: Array<{ label: string; value: string }>;
  codeContent?: string;
  duration?: number;
}

const props = defineProps<{
  isOpen: boolean;
  slides: SlideData[];
}>();

const emit = defineEmits(['close']);

const currentIndex = ref(0);
const progress = ref(0);
const isPaused = ref(false);
let timer: number | null = null;
const DEFAULT_DURATION = 5000;
let elapsedTime = 0;

const currentSlideDuration = computed(() => {
  return props.slides[currentIndex.value]?.duration || DEFAULT_DURATION;
});

const startTimer = () => {
  stopTimer();
  // Don't reset elapsedTime if just resuming
  if (progress.value === 0) {
    elapsedTime = 0;
  }
  
  timer = window.setInterval(() => {
    if (isPaused.value) return;

    elapsedTime += 50;
    const duration = currentSlideDuration.value;
    progress.value = Math.min((elapsedTime / duration) * 100, 100);
    
    if (elapsedTime >= duration) {
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

const togglePause = () => {
  isPaused.value = !isPaused.value;
};

const nextSlide = () => {
  if (currentIndex.value < props.slides.length - 1) {
    currentIndex.value++;
    progress.value = 0;
    elapsedTime = 0;
    // Keep pause state or reset? Usually reset to play on next slide
    // isPaused.value = false; 
  } else {
    close();
  }
};

const prevSlide = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--;
    progress.value = 0;
    elapsedTime = 0;
  } else {
    // Reset current slide
    progress.value = 0;
    elapsedTime = 0;
  }
};

const close = () => {
  stopTimer();
  emit('close');
  currentIndex.value = 0;
  progress.value = 0;
  elapsedTime = 0;
  isPaused.value = false;
};

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    currentIndex.value = 0;
    progress.value = 0;
    elapsedTime = 0;
    isPaused.value = false;
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
          <div class="w-1/3 h-full" @click="togglePause"></div> <!-- Center taps toggle pause -->
          <div class="w-1/3 h-full" @click="nextSlide"></div>
        </div>

        <!-- Pause/Resume Control (Visual Indicator) -->
        <div class="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-50">
          <button 
            @click.stop="togglePause"
            class="p-3 rounded-full bg-black/40 backdrop-blur-md border border-white/20 hover:bg-black/60 transition-all active:scale-95"
          >
            <svg v-if="isPaused" xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
