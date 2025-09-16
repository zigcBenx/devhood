<template>
  <div class="bg-gray-900/50 border border-green-500/20 rounded-lg p-6 space-y-6">
    <!-- Profile Display Settings -->
    <div class="space-y-4">
      <h3 class="text-lg font-semibold text-green-400">Profile Display</h3>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm text-green-300/80 mb-2">Display Name</label>
          <input
            v-model="settings.displayName"
            type="text"
            :placeholder="username"
            class="w-full bg-gray-800 border border-green-500/30 rounded px-3 py-2 text-green-400 focus:border-green-400 focus:outline-none"
          >
        </div>

        <div>
          <label class="block text-sm text-green-300/80 mb-2">Location</label>
          <input
            v-model="settings.location"
            type="text"
            placeholder="e.g. San Francisco, CA"
            class="w-full bg-gray-800 border border-green-500/30 rounded px-3 py-2 text-green-400 focus:border-green-400 focus:outline-none"
          >
        </div>
      </div>

      <div>
        <label class="block text-sm text-green-300/80 mb-2">Bio</label>
        <textarea
          v-model="settings.bio"
          rows="3"
          placeholder="Tell the world about yourself..."
          class="w-full bg-gray-800 border border-green-500/30 rounded px-3 py-2 text-green-400 focus:border-green-400 focus:outline-none resize-none"
        ></textarea>
      </div>

      <div>
        <label class="block text-sm text-green-300/80 mb-2">Website</label>
        <input
          v-model="settings.website"
          type="url"
          placeholder="https://yourwebsite.com"
          class="w-full bg-gray-800 border border-green-500/30 rounded px-3 py-2 text-green-400 focus:border-green-400 focus:outline-none"
        >
      </div>
    </div>

    <!-- Contribution Heatmap Settings -->
    <div class="border-t border-green-500/20 pt-6 space-y-4">
      <h3 class="text-lg font-semibold text-green-400">Contribution Heatmap</h3>

      <div class="space-y-4">
        <div>
          <label class="block text-sm text-green-300/80 mb-2">Heatmap Style</label>
          <div class="grid grid-cols-3 gap-2">
            <button
              v-for="style in heatmapStyles"
              :key="style.value"
              @click="settings.heatmapStyle = style.value"
              :class="[
                'p-3 rounded border text-sm transition-colors',
                settings.heatmapStyle === style.value
                  ? 'bg-green-500 text-black border-green-500'
                  : 'bg-gray-800 text-green-400 border-green-500/30 hover:border-green-400'
              ]"
            >
              {{ style.label }}
            </button>
          </div>
        </div>

        <div v-if="gitlabConnected" class="space-y-3">
          <div class="flex items-center gap-3">
            <input
              id="combinedView"
              v-model="settings.combinedView"
              type="checkbox"
              class="w-4 h-4 text-green-500 bg-gray-800 border-green-500/30 rounded focus:ring-green-500"
            >
            <label for="combinedView" class="text-sm text-green-300/80">
              Show combined GitHub + GitLab contributions
            </label>
          </div>

          <div class="flex items-center gap-3">
            <input
              id="showPrivate"
              v-model="settings.showPrivateContributions"
              type="checkbox"
              class="w-4 h-4 text-green-500 bg-gray-800 border-green-500/30 rounded focus:ring-green-500"
            >
            <label for="showPrivate" class="text-sm text-green-300/80">
              Include private repository contributions
            </label>
          </div>
        </div>

        <!-- Heatmap Preview -->
        <div class="bg-gray-800/50 rounded-lg p-4">
          <h4 class="text-sm font-semibold text-green-400 mb-3">Preview</h4>
          <div class="space-y-2">
            <div class="flex gap-1">
              <div
                v-for="week in 12"
                :key="week"
                class="flex flex-col gap-1"
              >
                <div
                  v-for="day in 7"
                  :key="day"
                  :class="[
                    'w-3 h-3 rounded-sm',
                    getHeatmapColor(Math.random())
                  ]"
                ></div>
              </div>
            </div>
            <div class="flex items-center justify-between text-xs text-green-300/60">
              <span>Less</span>
              <div class="flex gap-1">
                <div
                  v-for="level in 5"
                  :key="level"
                  :class="['w-3 h-3 rounded-sm', getHeatmapColor(level / 5)]"
                ></div>
              </div>
              <span>More</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Theme Settings -->
    <div class="border-t border-green-500/20 pt-6 space-y-4">
      <h3 class="text-lg font-semibold text-green-400">Theme</h3>

      <div class="grid grid-cols-2 gap-2">
        <button
          v-for="theme in themes"
          :key="theme.value"
          @click="settings.theme = theme.value"
          :class="[
            'p-4 rounded border text-sm transition-colors flex items-center gap-3',
            settings.theme === theme.value
              ? 'bg-green-500 text-black border-green-500'
              : 'bg-gray-800 text-green-400 border-green-500/30 hover:border-green-400'
          ]"
        >
          <div :class="['w-4 h-4 rounded-full', theme.color]"></div>
          {{ theme.label }}
        </button>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="border-t border-green-500/20 pt-6 flex gap-4 justify-end">
      <button
        @click="resetSettings"
        class="px-6 py-2 border border-green-500/30 text-green-400 rounded hover:border-green-400 transition-colors"
      >
        Reset to Defaults
      </button>
      <button
        @click="saveSettings"
        class="px-6 py-2 bg-green-500 text-black rounded font-semibold hover:bg-green-400 transition-colors"
      >
        Save & Continue
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  githubConnected: boolean
  gitlabConnected: boolean
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
  'update:settings': [settings: typeof props.settings]
}>()

const settings = computed({
  get: () => props.settings,
  set: (value) => emit('update:settings', value)
})

const heatmapStyles = [
  { value: 'github', label: 'GitHub Style' },
  { value: 'gitlab', label: 'GitLab Style' },
  { value: 'custom', label: 'Custom' }
]

const themes = [
  { value: 'dark', label: 'Dark Terminal', color: 'bg-green-500' },
  { value: 'light', label: 'Light Mode', color: 'bg-blue-500' }
]

const getHeatmapColor = (intensity: number) => {
  const styles = {
    github: [
      'bg-gray-700',
      'bg-green-900',
      'bg-green-700',
      'bg-green-500',
      'bg-green-400'
    ],
    gitlab: [
      'bg-gray-700',
      'bg-orange-900',
      'bg-orange-700',
      'bg-orange-500',
      'bg-orange-400'
    ],
    custom: [
      'bg-gray-700',
      'bg-purple-900',
      'bg-purple-700',
      'bg-purple-500',
      'bg-purple-400'
    ]
  }

  const colorSet = styles[settings.value.heatmapStyle as keyof typeof styles] || styles.github
  return colorSet[Math.floor(intensity * (colorSet.length - 1))]
}

const resetSettings = () => {
  settings.value = {
    theme: 'dark',
    showPrivateContributions: false,
    heatmapStyle: 'github',
    combinedView: true,
    displayName: '',
    bio: '',
    location: '',
    website: ''
  }
}

const saveSettings = () => {
  emit('complete')
}
</script>