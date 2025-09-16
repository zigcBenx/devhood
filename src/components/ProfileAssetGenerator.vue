<template>
  <div class="bg-gray-900/50 border border-green-500/20 rounded-lg p-6 space-y-6">
    <!-- Profile Card Preview -->
    <div class="space-y-4">
      <h3 class="text-lg font-semibold text-green-400">Generated Profile Assets</h3>

      <!-- Profile Card -->
      <div class="bg-gray-800 border border-green-500/30 rounded-lg p-6 max-w-md">
        <div class="flex items-center gap-4 mb-4">
          <div class="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-black font-bold text-xl">
            {{ username[0]?.toUpperCase() }}
          </div>
          <div>
            <h4 class="text-xl font-bold text-green-400">{{ settings.displayName || username }}</h4>
            <p class="text-green-300/60">@{{ username }}</p>
            <p v-if="settings.location" class="text-sm text-green-300/60">📍 {{ settings.location }}</p>
          </div>
        </div>

        <p v-if="settings.bio" class="text-green-300/80 mb-4 text-sm">{{ settings.bio }}</p>

        <!-- Mini Contribution Graph -->
        <div class="space-y-2">
          <h5 class="text-sm font-semibold text-green-400">Contribution Activity</h5>
          <div class="flex gap-1">
            <div
              v-for="week in 8"
              :key="week"
              class="flex flex-col gap-1"
            >
              <div
                v-for="day in 7"
                :key="day"
                :class="[
                  'w-2 h-2 rounded-sm',
                  getContributionColor(Math.random())
                ]"
              ></div>
            </div>
          </div>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-green-500/20">
          <div class="text-center">
            <div class="text-lg font-bold text-green-400">{{ mockStats.repos }}</div>
            <div class="text-xs text-green-300/60">Repositories</div>
          </div>
          <div class="text-center">
            <div class="text-lg font-bold text-green-400">{{ mockStats.commits }}</div>
            <div class="text-xs text-green-300/60">Commits</div>
          </div>
          <div class="text-center">
            <div class="text-lg font-bold text-green-400">{{ mockStats.streak }}</div>
            <div class="text-xs text-green-300/60">Day Streak</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Asset Generation Options -->
    <div class="border-t border-green-500/20 pt-6 space-y-4">
      <h3 class="text-lg font-semibold text-green-400">Export Options</h3>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Profile Card Image -->
        <div class="bg-gray-800/50 rounded-lg p-4">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-8 h-8 bg-green-500/20 rounded flex items-center justify-center">
              🖼️
            </div>
            <div>
              <h4 class="font-semibold text-green-400">Profile Card</h4>
              <p class="text-xs text-green-300/60">Static profile overview</p>
            </div>
          </div>

          <div class="space-y-2">
            <div class="flex items-center gap-2">
              <input
                id="card-png"
                v-model="selectedFormats"
                value="card-png"
                type="checkbox"
                class="w-4 h-4 text-green-500 bg-gray-800 border-green-500/30 rounded"
              >
              <label for="card-png" class="text-sm text-green-300/80">PNG (800x400)</label>
            </div>
            <div class="flex items-center gap-2">
              <input
                id="card-svg"
                v-model="selectedFormats"
                value="card-svg"
                type="checkbox"
                class="w-4 h-4 text-green-500 bg-gray-800 border-green-500/30 rounded"
              >
              <label for="card-svg" class="text-sm text-green-300/80">SVG (Scalable)</label>
            </div>
          </div>
        </div>

        <!-- Contribution Graph -->
        <div class="bg-gray-800/50 rounded-lg p-4">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-8 h-8 bg-green-500/20 rounded flex items-center justify-center">
              📊
            </div>
            <div>
              <h4 class="font-semibold text-green-400">Contribution Graph</h4>
              <p class="text-xs text-green-300/60">GitHub-style heatmap</p>
            </div>
          </div>

          <div class="space-y-2">
            <div class="flex items-center gap-2">
              <input
                id="graph-png"
                v-model="selectedFormats"
                value="graph-png"
                type="checkbox"
                class="w-4 h-4 text-green-500 bg-gray-800 border-green-500/30 rounded"
              >
              <label for="graph-png" class="text-sm text-green-300/80">PNG (1200x300)</label>
            </div>
            <div class="flex items-center gap-2">
              <input
                id="graph-svg"
                v-model="selectedFormats"
                value="graph-svg"
                type="checkbox"
                class="w-4 h-4 text-green-500 bg-gray-800 border-green-500/30 rounded"
              >
              <label for="graph-svg" class="text-sm text-green-300/80">SVG (Dynamic)</label>
            </div>
          </div>
        </div>

        <!-- Stats Widget -->
        <div class="bg-gray-800/50 rounded-lg p-4">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-8 h-8 bg-green-500/20 rounded flex items-center justify-center">
              📈
            </div>
            <div>
              <h4 class="font-semibold text-green-400">Stats Widget</h4>
              <p class="text-xs text-green-300/60">Compact statistics</p>
            </div>
          </div>

          <div class="space-y-2">
            <div class="flex items-center gap-2">
              <input
                id="stats-png"
                v-model="selectedFormats"
                value="stats-png"
                type="checkbox"
                class="w-4 h-4 text-green-500 bg-gray-800 border-green-500/30 rounded"
              >
              <label for="stats-png" class="text-sm text-green-300/80">PNG (400x200)</label>
            </div>
            <div class="flex items-center gap-2">
              <input
                id="stats-svg"
                v-model="selectedFormats"
                value="stats-svg"
                type="checkbox"
                class="w-4 h-4 text-green-500 bg-gray-800 border-green-500/30 rounded"
              >
              <label for="stats-svg" class="text-sm text-green-300/80">SVG (Live Updates)</label>
            </div>
          </div>
        </div>

        <!-- Animated Badge -->
        <div class="bg-gray-800/50 rounded-lg p-4">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-8 h-8 bg-green-500/20 rounded flex items-center justify-center">
              ⚡
            </div>
            <div>
              <h4 class="font-semibold text-green-400">Animated Badge</h4>
              <p class="text-xs text-green-300/60">Live typing effect</p>
            </div>
          </div>

          <div class="space-y-2">
            <div class="flex items-center gap-2">
              <input
                id="badge-gif"
                v-model="selectedFormats"
                value="badge-gif"
                type="checkbox"
                class="w-4 h-4 text-green-500 bg-gray-800 border-green-500/30 rounded"
              >
              <label for="badge-gif" class="text-sm text-green-300/80">Animated GIF</label>
            </div>
            <div class="flex items-center gap-2">
              <input
                id="badge-svg"
                v-model="selectedFormats"
                value="badge-svg"
                type="checkbox"
                class="w-4 h-4 text-green-500 bg-gray-800 border-green-500/30 rounded"
              >
              <label for="badge-svg" class="text-sm text-green-300/80">SVG Animation</label>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Generation Progress -->
    <div v-if="generating" class="border-t border-green-500/20 pt-6">
      <div class="bg-gray-800/50 rounded-lg p-4">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          <span class="text-green-400 font-semibold">Generating Assets...</span>
        </div>

        <div class="space-y-2">
          <div
            v-for="(asset, index) in generationQueue"
            :key="asset"
            class="flex items-center gap-2"
          >
            <div
              :class="[
                'w-4 h-4 rounded-full flex items-center justify-center text-xs',
                index < currentGenerationIndex
                  ? 'bg-green-500 text-black'
                  : index === currentGenerationIndex
                  ? 'bg-green-500/50 animate-pulse'
                  : 'bg-gray-600'
              ]"
            >
              <span v-if="index < currentGenerationIndex">✓</span>
            </div>
            <span
              :class="[
                'text-sm',
                index <= currentGenerationIndex ? 'text-green-400' : 'text-green-300/60'
              ]"
            >
              {{ asset }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Generated Assets -->
    <div v-if="generatedAssets.length > 0" class="border-t border-green-500/20 pt-6">
      <h3 class="text-lg font-semibold text-green-400 mb-4">Generated Assets</h3>

      <div class="space-y-4">
        <div
          v-for="asset in generatedAssets"
          :key="asset.name"
          class="bg-gray-800/50 rounded-lg p-4 flex items-center justify-between"
        >
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 bg-green-500/20 rounded flex items-center justify-center">
              {{ asset.icon }}
            </div>
            <div>
              <div class="font-semibold text-green-400">{{ asset.name }}</div>
              <div class="text-sm text-green-300/60">{{ asset.size }}</div>
            </div>
          </div>

          <div class="flex gap-2">
            <button
              @click="downloadAsset(asset)"
              class="px-3 py-1 text-sm bg-green-500 text-black rounded hover:bg-green-400 transition-colors"
            >
              Download
            </button>
            <button
              @click="copyAssetUrl(asset)"
              class="px-3 py-1 text-sm border border-green-500/30 text-green-400 rounded hover:border-green-400 transition-colors"
            >
              Copy URL
            </button>
          </div>
        </div>
      </div>

      <!-- README Code -->
      <div class="mt-6 bg-gray-800 rounded-lg p-4">
        <div class="flex items-center justify-between mb-3">
          <h4 class="font-semibold text-green-400">Add to GitHub README</h4>
          <button
            @click="copyReadmeCode"
            class="text-sm px-3 py-1 border border-green-500/30 text-green-400 rounded hover:border-green-400 transition-colors"
          >
            Copy Code
          </button>
        </div>

        <pre class="text-sm text-green-300/80 overflow-x-auto"><code>{{ readmeCode }}</code></pre>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="border-t border-green-500/20 pt-6 flex gap-4 justify-end">
      <button
        v-if="!generating && generatedAssets.length === 0"
        @click="generateAssets"
        :disabled="selectedFormats.length === 0"
        class="px-6 py-2 bg-green-500 text-black rounded font-semibold hover:bg-green-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Generate Assets ({{ selectedFormats.length }} selected)
      </button>

      <button
        v-if="generatedAssets.length > 0"
        @click="completeSetup"
        class="px-6 py-2 bg-green-500 text-black rounded font-semibold hover:bg-green-400 transition-colors"
      >
        Complete Setup
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { apiService } from '@/services/api'

const props = defineProps<{
  username: string
  settings: {
    theme: string
    showPrivateContributions: boolean
    heatmapStyle: string
    combinedView: boolean
    displayName: string
    bio: string
    location: string
    website: string
  }
}>()

const emit = defineEmits<{
  complete: []
}>()

const selectedFormats = ref(['card-png', 'graph-svg'])
const generating = ref(false)
const currentGenerationIndex = ref(0)
const generatedAssets = ref<Array<{
  name: string
  size: string
  icon: string
  url: string
  format: string
}>>([])

const mockStats = {
  repos: 42,
  commits: 1337,
  streak: 15
}

const generationQueue = computed(() => {
  return selectedFormats.value.map(format => {
    const formatMap: Record<string, string> = {
      'card-png': 'Profile Card (PNG)',
      'card-svg': 'Profile Card (SVG)',
      'graph-png': 'Contribution Graph (PNG)',
      'graph-svg': 'Contribution Graph (SVG)',
      'stats-png': 'Stats Widget (PNG)',
      'stats-svg': 'Stats Widget (SVG)',
      'badge-gif': 'Animated Badge (GIF)',
      'badge-svg': 'Animated Badge (SVG)'
    }
    return formatMap[format] || format
  })
})

const readmeCode = computed(() => {
  if (generatedAssets.value.length === 0) return ''

  const lines = []
  lines.push(`## 👋 Hi, I'm ${props.settings.displayName || props.username}!`)

  if (props.settings.bio) {
    lines.push('')
    lines.push(props.settings.bio)
  }

  lines.push('')

  generatedAssets.value.forEach(asset => {
    if (asset.format.includes('card')) {
      lines.push(`![Profile Card](${asset.url})`)
    } else if (asset.format.includes('graph')) {
      lines.push(`![Contribution Graph](${asset.url})`)
    } else if (asset.format.includes('stats')) {
      lines.push(`![GitHub Stats](${asset.url})`)
    }
  })

  return lines.join('\n')
})

const getContributionColor = (intensity: number) => {
  const colors = ['bg-gray-700', 'bg-green-900', 'bg-green-700', 'bg-green-500', 'bg-green-400']
  return colors[Math.floor(intensity * (colors.length - 1))]
}

const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

const generateAssets = async () => {
  generating.value = true
  currentGenerationIndex.value = 0
  generatedAssets.value = []

  for (let i = 0; i < generationQueue.value.length; i++) {
    currentGenerationIndex.value = i

    const format = selectedFormats.value[i]
    const [type, ext] = format.split('-') as [string, string]

    try {
      // Generate the asset URL with current settings
      const params: Record<string, string> = {
        theme: props.settings.theme,
        combined: props.settings.combinedView ? 'true' : 'false'
      }

      const url = apiService.getAssetUrl(props.username, type as any, ext as any, params)

      // Test if the asset can be generated by making a HEAD request
      const response = await fetch(url, { method: 'HEAD' })
      if (!response.ok) {
        throw new Error(`Failed to generate ${format}`)
      }

      const contentLength = response.headers.get('content-length')
      const size = contentLength ? formatBytes(parseInt(contentLength)) : 'Unknown'

      const assetInfo = {
        'card': { name: 'Profile Card', icon: '🖼️' },
        'graph': { name: 'Contribution Graph', icon: '📊' },
        'stats': { name: 'Stats Widget', icon: '📈' },
        'badge': { name: 'Animated Badge', icon: '⚡' }
      }

      const info = assetInfo[type as keyof typeof assetInfo]
      if (info) {
        generatedAssets.value.push({
          name: `${info.name} (${ext.toUpperCase()})`,
          size,
          icon: info.icon,
          url,
          format
        })
      }

      // Add some delay for better UX
      await new Promise(resolve => setTimeout(resolve, 800))

    } catch (error) {
      console.error(`Failed to generate ${format}:`, error)
      // Continue with other assets even if one fails
    }
  }

  generating.value = false
}

const downloadAsset = (asset: typeof generatedAssets.value[0]) => {
  const link = document.createElement('a')
  link.href = asset.url
  link.download = `${props.username}-${asset.format}`
  link.target = '_blank'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const copyAssetUrl = async (asset: typeof generatedAssets.value[0]) => {
  try {
    await navigator.clipboard.writeText(asset.url)
    // Could add a toast notification here
  } catch (error) {
    console.error('Failed to copy URL:', error)
  }
}

const copyReadmeCode = async () => {
  try {
    await navigator.clipboard.writeText(readmeCode.value)
    // Could add a toast notification here
  } catch (error) {
    console.error('Failed to copy README code:', error)
  }
}

const completeSetup = () => {
  emit('complete')
}
</script>