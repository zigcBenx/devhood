<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';

interface Props {
  text: string;
  speed?: number;
  delay?: number;
  cursor?: boolean;
  isActive?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  speed: 50,
  delay: 0,
  cursor: true,
  isActive: false
});

const emit = defineEmits<{
  complete: [];
}>();

const displayedText = ref('');
const showCursor = ref(true);
const isTyping = ref(false);

const startTyping = async () => {
  if (isTyping.value) return;
  
  displayedText.value = '';
  showCursor.value = props.cursor;
  isTyping.value = true;

  // Initial delay
  if (props.delay > 0) {
    await new Promise(resolve => setTimeout(resolve, props.delay));
  }

  // Type out the text
  const chars = props.text.split('');
  for (let i = 0; i < chars.length; i++) {
    displayedText.value += chars[i];
    await new Promise(resolve => setTimeout(resolve, props.speed + Math.random() * 20));
  }

  isTyping.value = false;
  
  // Hide cursor after a delay
  setTimeout(() => {
    showCursor.value = false;
  }, 2000);

  emit('complete');
};

watch(() => props.isActive, (newVal) => {
  if (newVal) {
    startTyping();
  } else {
    displayedText.value = '';
    showCursor.value = false;
    isTyping.value = false;
  }
}, { immediate: true });
</script>

<template>
  <div class="typewriter-text text-2xl md:text-4xl font-light leading-relaxed opacity-90 text-green-400/90">
    <span>{{ displayedText }}</span>
    <span 
      v-if="showCursor" 
      class="cursor animate-blink inline-block w-3 h-8 bg-green-500 ml-1 align-middle shadow-[0_0_10px_rgba(34,197,94,0.8)]"
    ></span>
  </div>
</template>

<style scoped>
.typewriter-text {
  font-family: monospace;
}

.animate-blink {
  animation: blink 1s step-end infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}
</style>
