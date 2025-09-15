<template>
  <div class="min-h-screen bg-black text-green-400 font-mono overflow-hidden relative">
    <!-- Animated background grid -->
    <div class="absolute inset-0 bg-[linear-gradient(rgba(0,255,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.03)_1px,transparent_1px)] bg-[size:20px_20px] animate-pulse"></div>
    
    <div class="relative z-10 container mx-auto px-6 py-16 max-w-4xl">
      <!-- Hero Section -->
      <div class="text-center mb-16">
        <!-- Terminal-style header -->
        <div class="inline-block bg-gray-900/80 border border-green-500/30 rounded-lg p-4 mb-8 backdrop-blur-sm">
          <div class="flex items-center gap-2 mb-2">
            <div class="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
            <div class="w-3 h-3 rounded-full bg-yellow-500 animate-pulse" style="animation-delay: 0.5s"></div>
            <div class="w-3 h-3 rounded-full bg-green-500 animate-pulse" style="animation-delay: 1s"></div>
          </div>
          <div class="text-green-400 text-sm font-mono">$ git clone https://github.com/devhood</div>
        </div>

        <h1 class="text-6xl md:text-7xl font-black mb-6 bg-gradient-to-r from-green-400 via-green-300 to-green-500 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(0,255,0,0.3)]">
          DevHood
        </h1>
        
        <p class="text-2xl text-green-200/80 mb-8 leading-relaxed font-light tracking-wide">
          What does your <span class="text-green-400 font-semibold">dev fingerprint</span> look like?
        </p>
        
        <p class="text-lg text-green-300/60 mb-12">
          Connect your GitHub & GitLab to unlock achievements and showcase your coding journey
        </p>

        <!-- Search Input -->
        <div class="max-w-lg mx-auto mb-12">
          <div class="relative group">
            <input
              v-model="username"
              @keyup.enter="searchProfile"
              type="text"
              placeholder="Enter GitHub username..."
              class="w-full px-6 py-4 bg-gray-900/60 border border-green-500/30 rounded-lg text-green-300 placeholder-green-400/50 text-lg font-mono focus:outline-none focus:border-green-400 focus:bg-gray-800/70 transition-all duration-300 focus:shadow-[0_0_20px_rgba(0,255,0,0.2)] backdrop-blur-sm"
            />
            <button
              @click="searchProfile"
              :disabled="!username.trim()"
              class="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-green-500 text-black rounded-md hover:bg-green-400 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              →
            </button>
          </div>
        </div>
      </div>

      <!-- Featured Profiles -->
      <div class="mb-16">
        <h2 class="text-3xl font-bold mb-8 text-center text-green-400 tracking-wider">
          <span class="inline-block animate-pulse">[</span> FEATURED DEVS <span class="inline-block animate-pulse">]</span>
        </h2>
        
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div
            v-for="(dev, index) in featuredDevs"
            :key="dev.username"
            @click="goToProfile(dev.username)"
            class="group relative p-6 bg-gray-900/40 border border-green-500/30 rounded-lg backdrop-blur-sm hover:border-green-400 hover:bg-gray-800/60 transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,255,0,0.2)] cursor-pointer hover:scale-105"
            :style="{ animationDelay: `${index * 0.1}s` }"
          >
            <div class="text-center">
              <div class="w-16 h-16 bg-green-500/20 rounded-full mx-auto mb-3 flex items-center justify-center border border-green-500/40 group-hover:border-green-400 transition-colors">
                <span class="text-green-400 font-mono text-lg font-bold">{{ dev.username.slice(0, 2).toUpperCase() }}</span>
              </div>
              <p class="text-green-300 font-semibold text-sm">{{ dev.username }}</p>
              <p class="text-green-400/60 text-xs mt-1">{{ dev.description }}</p>
            </div>
            <div class="absolute inset-0 bg-green-500/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
        </div>
      </div>

      <!-- CTA Section -->
      <div class="text-center">
        <div class="inline-block bg-gray-900/60 border border-green-500/30 rounded-lg p-6 backdrop-blur-sm">
          <p class="text-green-300 text-lg mb-2">
            Your dev fingerprint awaits.
          </p>
          <p class="text-green-400/60 text-sm font-mono">
            → devhood.dev
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const username = ref('')

const featuredDevs = [
  { username: 'torvalds', description: 'Linux Creator' },
  { username: 'gaearon', description: 'React Core' },
  { username: 'sindresorhus', description: 'OSS Legend' },
  { username: 'addyosmani', description: 'Web Perf' },
  { username: 'tj', description: 'Node Pioneer' },
  { username: 'defunkt', description: 'GitHub Co-founder' },
  { username: 'octocat', description: 'GitHub Mascot' },
  { username: 'mojombo', description: 'GitHub Co-founder' }
]

const searchProfile = () => {
  if (username.value.trim()) {
    router.push(`/${username.value.trim()}`)
  }
}

const goToProfile = (user: string) => {
  router.push(`/${user}`)
}
</script>