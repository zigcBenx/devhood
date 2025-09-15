<template>
  <span :class="cn('relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full', $attrs.class)">
    <img
      v-if="src"
      :src="src"
      :alt="alt"
      class="aspect-square h-full w-full object-cover"
      @error="onImageError"
    />
    <span
      v-else
      class="flex h-full w-full items-center justify-center rounded-full bg-muted text-muted-foreground"
    >
      <slot>
        {{ fallback }}
      </slot>
    </span>
  </span>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { cn } from '@/lib/utils'

interface Props {
  src?: string
  alt?: string
  fallback?: string
}

const props = withDefaults(defineProps<Props>(), {
  alt: '',
  fallback: ''
})

const src = ref(props.src)

const onImageError = () => {
  src.value = undefined
}
</script>