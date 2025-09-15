<template>
  <div class="min-h-screen bg-black text-green-400 font-mono overflow-hidden relative flex items-center justify-center">
    <!-- Animated background grid -->
    <div class="absolute inset-0 bg-[linear-gradient(rgba(0,255,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.03)_1px,transparent_1px)] bg-[size:20px_20px] animate-pulse"></div>
    
    <div class="relative z-10 text-center">
      <div class="inline-block bg-gray-900/80 border border-green-500/30 rounded-lg p-8 backdrop-blur-sm">
        <div class="flex items-center gap-2 mb-6 justify-center">
          <div class="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
          <div class="w-3 h-3 rounded-full bg-green-500 animate-pulse" style="animation-delay: 0.5s"></div>
          <div class="w-3 h-3 rounded-full bg-green-500 animate-pulse" style="animation-delay: 1s"></div>
        </div>
        <div class="text-green-400 text-lg font-mono mb-2">$ authenticating...</div>
        <div class="text-green-300/60 text-sm">Processing login callback</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

onMounted(() => {
  // Auth0 will handle the callback automatically
  // After successful authentication, redirect back to original page or home
  setTimeout(() => {
    const redirectPath = localStorage.getItem('auth_redirect_path')
    if (redirectPath && redirectPath !== '/callback') {
      localStorage.removeItem('auth_redirect_path')
      router.push(redirectPath)
    } else {
      router.push('/')
    }
  }, 3000)
})
</script>