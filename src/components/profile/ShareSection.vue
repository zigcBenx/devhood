<template>
  <div class="mb-12">
    <ShareProfile
      v-if="profile.isClaimed && claimedProfile"
      :profile="claimedProfile"
      :share-stats="shareStats"
    />

    <div v-else class="text-center">
      <div :class="containerClasses">
        <p class="text-green-300 text-lg mb-4">Your dev fingerprint. Want yours?</p>

        <div class="flex gap-4 justify-center">
          <button @click="emit('share')" :class="shareBtnClasses">
            <Share class="h-4 w-4" />
            Share Profile
          </button>

          <button @click="$router.push('/')" :class="homeBtnClasses">
            → devhood.dev
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import ShareProfile from '@/components/ShareProfile.vue'
import { Share } from 'lucide-vue-next'
import { useStyles } from '@/composables/useStyles'

interface Profile {
  isClaimed: boolean
  [key: string]: any
}

interface ClaimedProfile {
  username: string
  display_name?: string
  [key: string]: any
}

interface Props {
  profile: Profile
  claimedProfile: ClaimedProfile | null
  shareStats: { views: number; shares: number; clicks: number } | null
}

interface Emits {
  (e: 'share'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const router = useRouter()
const { classes } = useStyles()

const containerClasses = computed(() =>
  `inline-block ${classes.card} p-6`
)

const shareBtnClasses = computed(() =>
  'px-6 py-2 bg-green-500 text-black rounded-md hover:bg-green-400 transition-colors font-semibold flex items-center gap-2'
)

const homeBtnClasses = computed(() =>
  'px-6 py-2 bg-gray-700 text-green-400 border border-green-500/30 rounded-md hover:border-green-400 transition-colors font-semibold'
)
</script>
