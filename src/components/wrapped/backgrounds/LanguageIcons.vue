<script setup lang="ts">
const languageIcons = [
  'JS', 'TS', 'PY', 'RS', 'GO', 'JAVA', 'C++', 'PHP', 'RB', 'SWIFT', 
  'KOTLIN', 'C#', 'HTML', 'CSS', 'SQL', 'VUE', 'REACT', 'ANGULAR'
].map((text, i) => ({
  text,
  style: {
    left: `${Math.random() * 90}%`,
    top: `${Math.random() * 90}%`,
    animationDelay: `${Math.random() * 5}s`,
    fontSize: `${20 + Math.random() * 20}px`,
    opacity: 0.3
  }
}));
</script>

<template>
  <div class="absolute inset-0 z-0 overflow-hidden">
    <div v-for="(lang, i) in languageIcons" :key="i"
         class="absolute text-green-500/20 font-black animate-pulse-random"
         :style="lang.style"
    >
      {{ lang.text }}
    </div>
    <!-- Scanline effect -->
    <div class="absolute inset-0 bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==')] opacity-10 pointer-events-none z-10"></div>
  </div>
</template>

<style scoped>
.animate-pulse-random {
  animation: pulseRandom 2s infinite;
}

@keyframes pulseRandom {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.8; }
}
</style>
