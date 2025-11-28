<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  layout?: 'intro' | 'stat-big' | 'stat-grid' | 'rank' | 'outro' | 'default';
  title: string;
  subtitle?: string;
  stat?: string | number;
  statLabel?: string;
  description?: string;
  bgColor?: string;
  textColor?: string;
  image?: string;
  isActive: boolean;
  // For stat-grid
  stats?: Array<{ label: string; value: string | number }>;
  // For rank
  rankIcon?: string;
}

const props = withDefaults(defineProps<Props>(), {
  layout: 'default',
  bgColor: 'bg-gray-900',
  textColor: 'text-white',
});

const slideStyle = computed(() => {
  return props.image 
    ? { backgroundImage: `url(${props.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : {};
});

// Animation classes based on layout
const titleClass = computed(() => {
  switch (props.layout) {
    case 'intro': return 'text-5xl md:text-7xl font-black mb-6 tracking-tighter animate-slide-in-left';
    case 'stat-big': return 'text-2xl md:text-3xl font-bold mb-8 uppercase tracking-widest opacity-80 animate-fade-in';
    case 'outro': return 'text-4xl md:text-6xl font-black mb-4 animate-scale-in';
    default: return 'text-3xl md:text-4xl font-bold mb-4 animate-fade-in-up';
  }
});

const statClass = computed(() => {
  switch (props.layout) {
    case 'stat-big': return 'text-7xl md:text-9xl font-black mb-4 tracking-tighter gradient-text animate-scale-up-bounce';
    case 'rank': return 'text-6xl md:text-8xl font-black mb-2 text-yellow-400 animate-pulse-slow';
    default: return 'text-6xl md:text-7xl font-black mb-2 tracking-tighter gradient-text';
  }
});
</script>

<template>
  <div 
    class="absolute inset-0 flex flex-col items-center justify-center p-8 text-center transition-opacity duration-500 overflow-hidden"
    :class="[bgColor, textColor, { 'opacity-100 z-10': isActive, 'opacity-0 z-0': !isActive }]"
    :style="slideStyle"
  >
    <!-- Background Effects -->
    <div v-if="image" class="absolute inset-0 bg-black/60 z-0"></div>
    <div v-else class="absolute inset-0 bg-gradient-to-b from-transparent to-black/30 z-0"></div>
    
    <!-- Content Container -->
    <div class="relative z-10 max-w-2xl w-full flex flex-col items-center">
      
      <!-- INTRO LAYOUT -->
      <template v-if="layout === 'intro'">
        <div class="mb-8 animate-float">
          <span class="text-6xl">🎁</span>
        </div>
        <h2 :class="titleClass">{{ title }}</h2>
        <p class="text-2xl font-light opacity-90 animate-fade-in-delay-1">{{ subtitle }}</p>
        <div class="mt-12 animate-pulse">
          <span class="px-6 py-3 bg-white/20 rounded-full text-sm font-bold uppercase tracking-widest backdrop-blur-sm">
            Tap to unwrap
          </span>
        </div>
      </template>

      <!-- BIG STAT LAYOUT -->
      <template v-else-if="layout === 'stat-big'">
        <h2 :class="titleClass">{{ title }}</h2>
        <div class="my-4">
          <div :class="statClass">{{ stat }}</div>
          <div class="text-xl md:text-2xl font-medium opacity-90 mt-2 animate-fade-in-delay-1">{{ statLabel }}</div>
        </div>
        <p v-if="description" class="text-lg leading-relaxed opacity-80 mt-8 max-w-md mx-auto animate-fade-in-delay-2">
          {{ description }}
        </p>
      </template>

      <!-- RANK LAYOUT -->
      <template v-else-if="layout === 'rank'">
        <div class="text-8xl mb-6 animate-bounce-custom">{{ rankIcon || '🏆' }}</div>
        <h2 :class="titleClass">{{ title }}</h2>
        <div class="my-6 p-6 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20 transform rotate-1 hover:rotate-0 transition-transform duration-300">
          <div :class="statClass">{{ stat }}</div>
          <div class="text-xl uppercase tracking-widest font-bold">{{ statLabel }}</div>
        </div>
        <p class="text-xl font-medium mt-4 animate-fade-in-delay-1">{{ description }}</p>
      </template>

      <!-- STAT GRID LAYOUT -->
      <template v-else-if="layout === 'stat-grid'">
        <h2 :class="titleClass">{{ title }}</h2>
        <div class="grid grid-cols-2 gap-4 w-full mt-8">
          <div 
            v-for="(item, idx) in stats" 
            :key="idx"
            class="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10 flex flex-col items-center justify-center aspect-square animate-stagger-in"
            :style="{ animationDelay: `${idx * 150}ms` }"
          >
            <div class="text-3xl md:text-4xl font-bold mb-1">{{ item.value }}</div>
            <div class="text-xs md:text-sm uppercase opacity-70">{{ item.label }}</div>
          </div>
        </div>
        <p class="mt-8 opacity-80">{{ description }}</p>
      </template>

      <!-- OUTRO LAYOUT -->
      <template v-else-if="layout === 'outro'">
        <h2 :class="titleClass">{{ title }}</h2>
        <p class="text-xl mb-12 opacity-90">{{ subtitle }}</p>
        
        <div class="grid grid-cols-2 gap-4 w-full max-w-sm mb-8">
          <div class="bg-gray-800 p-4 rounded-lg text-center">
            <div class="text-2xl font-bold text-green-400">{{ stat }}</div>
            <div class="text-xs opacity-60">Contributions</div>
          </div>
          <div class="bg-gray-800 p-4 rounded-lg text-center">
            <div class="text-2xl font-bold text-purple-400">{{ description }}</div> <!-- Reusing props for summary stats -->
            <div class="text-xs opacity-60">Top Lang</div>
          </div>
        </div>

        <button class="px-8 py-4 bg-white text-black rounded-full font-bold text-lg hover:scale-105 transition-transform animate-pulse-slow">
          Share Your Wrap 📤
        </button>
      </template>

      <!-- DEFAULT LAYOUT -->
      <template v-else>
        <h2 :class="titleClass">{{ title }}</h2>
        <p v-if="subtitle" class="text-xl opacity-90 mb-8">{{ subtitle }}</p>
        
        <div v-if="stat" class="my-8 transform transition-transform hover:scale-110 duration-300">
          <div :class="statClass">{{ stat }}</div>
          <div class="text-lg uppercase tracking-widest opacity-80 font-medium">{{ statLabel }}</div>
        </div>
        
        <p v-if="description" class="text-lg leading-relaxed opacity-90 mt-4">{{ description }}</p>
      </template>

    </div>
  </div>
</template>

<style scoped>
.gradient-text {
  background: linear-gradient(135deg, #fff 0%, #a5b4fc 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Animations */
.animate-fade-in-up { animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
.animate-fade-in { animation: fadeIn 1s ease-out forwards; opacity: 0; }
.animate-fade-in-delay-1 { animation: fadeIn 1s ease-out 0.3s forwards; opacity: 0; }
.animate-fade-in-delay-2 { animation: fadeIn 1s ease-out 0.6s forwards; opacity: 0; }
.animate-slide-in-left { animation: slideInLeft 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
.animate-scale-up-bounce { animation: scaleUpBounce 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; opacity: 0; }
.animate-scale-in { animation: scaleIn 0.6s ease-out forwards; opacity: 0; }
.animate-float { animation: float 3s ease-in-out infinite; }
.animate-pulse-slow { animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
.animate-bounce-custom { animation: bounce 2s infinite; }
.animate-stagger-in { animation: scaleIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; transform: scale(0.8); }

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideInLeft {
  from { opacity: 0; transform: translateX(-50px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes scaleUpBounce {
  from { opacity: 0; transform: scale(0.5); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

@keyframes bounce {
  0%, 100% { transform: translateY(-5%); animation-timing-function: cubic-bezier(0.8,0,1,1); }
  50% { transform: translateY(0); animation-timing-function: cubic-bezier(0,0,0.2,1); }
}
</style>
