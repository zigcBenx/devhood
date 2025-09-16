<template>
  <div class="min-h-screen bg-black text-green-400 font-mono flex items-center justify-center">
    <div class="text-center">
      <h1 class="text-2xl font-bold mb-4">🔥 TEST CALLBACK PAGE</h1>
      <p>Current URL: {{ currentUrl }}</p>
      <p>Route path: {{ $route.path }}</p>
      <p>Route params: {{ JSON.stringify($route.params) }}</p>
      <p>URL search: {{ urlSearch }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const currentUrl = ref('')
const urlSearch = ref('')

onMounted(() => {
  console.log('🔥🔥🔥 TEST CALLBACK PAGE MOUNTED')
  console.log('URL:', window.location.href)
  currentUrl.value = window.location.href
  urlSearch.value = window.location.search
})
</script>