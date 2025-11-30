<script setup lang="ts">
const projectNames = [
  'final-project', 'test-app', 'idea-1', 'startup-idea', 'todo-app', 
  'weather-app', 'chat-app', 'portfolio-v3', 'learn-rust', 'ai-wrapper',
  'crypto-bot', 'blog-v2', 'social-network', 'game-engine', 'utils'
].map((text, i) => ({
  text,
  style: {
    left: `${Math.random() * 80 + 10}%`,
    top: `${Math.random() * 80 + 10}%`,
    animationDelay: `${Math.random() * 5}s`,
    fontSize: `${14 + Math.random() * 10}px`
  }
}));
</script>

<template>
  <div class="absolute inset-0 z-0 overflow-hidden">
    <div v-for="(proj, i) in projectNames" :key="i"
         class="absolute text-gray-500/30 font-mono animate-float-random flex items-center gap-2"
         :style="proj.style"
    >
      <span>📁</span> {{ proj.text }}
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
