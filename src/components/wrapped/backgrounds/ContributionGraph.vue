<script setup lang="ts">
interface Props {
  fillDuration?: number;
  isActive?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  fillDuration: 5000,
  isActive: false
});
</script>

<template>
  <div class="absolute inset-0 z-0 overflow-hidden">
    <!-- Straight grid, filling like progress bar -->
    <div class="absolute inset-0 opacity-30 flex flex-wrap content-start">
      <div v-for="i in 800" :key="i" 
           class="w-4 h-4 m-[1px] rounded-[1px] transition-colors duration-300"
           :class="[
             'bg-gray-800', 
             { 'animate-fill-square': isActive }
           ]"
           :style="{ 
             animationDelay: `${(i / 800) * (fillDuration / 1000)}s`,
             animationFillMode: 'forwards'
           }"
      ></div>
    </div>
    <!-- Scanline effect -->
    <div class="absolute inset-0 bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==')] opacity-10 pointer-events-none z-10"></div>
    <div class="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/50 pointer-events-none z-10"></div>
  </div>
</template>

<style scoped>
@keyframes fillSquare {
  0% { background-color: rgb(31, 41, 55); }
  100% { background-color: rgb(34, 197, 94); }
}

.animate-fill-square {
  animation: fillSquare 1s ease-out forwards;
}
</style>
