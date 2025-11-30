<script setup lang="ts">
interface Props {
  src: string;
  glow?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const props = withDefaults(defineProps<Props>(), {
  glow: false,
  size: 'md'
});

const sizeClasses = {
  sm: 'w-20 h-20',
  md: 'w-32 h-32',
  lg: 'w-40 h-40'
};
</script>

<template>
  <div class="avatar-container relative">
    <div v-if="glow" class="absolute -inset-4 bg-green-500/20 blur-xl rounded-full animate-pulse-slow"></div>
    <img 
      :src="src" 
      :class="[
        sizeClasses[size],
        'rounded-full border-2 border-green-500/50 shadow-[0_0_20px_rgba(34,197,94,0.3)] relative z-10'
      ]"
      alt="Avatar"
    />
  </div>
</template>

<style scoped>
.animate-pulse-slow {
  animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
</style>
