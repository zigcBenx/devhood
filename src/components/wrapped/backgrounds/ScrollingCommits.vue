<script setup lang="ts">
const archiveCommits = Array.from({ length: 20 }, (_, i) => {
  const hash = Math.random().toString(16).substring(2, 9);
  const msgs = ['fix', 'wip', 'update', 'refactor', 'style', 'docs', 'test', 'merge', 'revert', 'init'];
  const msg = msgs[Math.floor(Math.random() * msgs.length)];
  return {
    text: `[${hash}] ${msg}`,
    style: {
      left: `${Math.random() * 60 + 20}%`,
      animationDelay: `${Math.random() * 5}s`,
      opacity: 0.1 + Math.random() * 0.2
    }
  };
});
</script>

<template>
  <div class="absolute inset-0 z-0 overflow-hidden font-mono text-xs">
    <div v-for="(commit, i) in archiveCommits" :key="i"
         class="absolute text-green-500/30 whitespace-nowrap animate-scroll-up"
         :style="commit.style"
    >
      {{ commit.text }}
    </div>
    <!-- Scanline effect -->
    <div class="absolute inset-0 bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==')] opacity-10 pointer-events-none z-10"></div>
  </div>
</template>

<style scoped>
.animate-scroll-up {
  animation: scrollUp 10s linear infinite;
}

@keyframes scrollUp {
  from { transform: translateY(100vh); opacity: 0; }
  10% { opacity: 0.3; }
  90% { opacity: 0.3; }
  to { transform: translateY(-20vh); opacity: 0; }
}
</style>
