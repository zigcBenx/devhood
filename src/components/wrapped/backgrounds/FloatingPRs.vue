<script setup lang="ts">
const prItems = [
  'PR #102', 'Merged', 'Conflict', 'Review', 'Approved', 'Changes Requested', 
  'PR #404', 'Force Push', 'Rebase', 'Squash', 'Cherry-pick', 'LGTM'
].map((text, i) => ({
  text,
  style: {
    left: `${Math.random() * 90}%`,
    top: `${Math.random() * 90}%`,
    animationDelay: `${Math.random() * 5}s`,
    fontSize: `${16 + Math.random() * 14}px`,
    opacity: 0.2
  }
}));
</script>

<template>
  <div class="absolute inset-0 z-0 overflow-hidden">
    <div v-for="(item, i) in prItems" :key="i"
         class="absolute text-red-500/20 font-bold animate-float-random"
         :style="item.style"
    >
      {{ item.text }}
    </div>
    <!-- Scanline effect -->
    <div class="absolute inset-0 bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==')] opacity-10 pointer-events-none z-10"></div>
  </div>
</template>

<style scoped>
.animate-float-random {
  animation: floatRandom 10s ease-in-out infinite;
}

@keyframes floatRandom {
  0%, 100% { transform: translate(0, 0); }
  25% { transform: translate(10px, -10px); }
  50% { transform: translate(-5px, 15px); }
  75% { transform: translate(-15px, -5px); }
}
</style>
