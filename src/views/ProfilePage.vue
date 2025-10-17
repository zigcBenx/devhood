<template>
  <div class="min-h-screen bg-black text-green-400 font-mono overflow-hidden relative">
    <div :class="bgGridClasses" />

    <div class="relative z-10">
      <LoadingState v-if="loading" :username="username" />

      <ErrorState v-else-if="error" :error="error" @retry="handleFetchProfile" />

      <div v-else-if="profile" class="container mx-auto px-6 py-12 max-w-6xl">
        <div class="flex justify-between items-center mb-8">
          <button @click="$router.push('/')" :class="backButtonClasses">
            ← Back to Home
          </button>
          <AuthButton />
        </div>

        <ProfileHeader :profile="profile" :profile-status="profileStatus" />

        <SocialLinks :links="profile.socialLinks" :username="profile.username" />

        <ConnectedProviders
          v-if="profile.isClaimed && profile.providers.length"
          :providers="profile.providers"
          :stats="{
            totalRepos: profile.mergedStats.totalRepositories,
            totalStars: profile.mergedStats.totalStars,
            totalContributions: profile.mergedStats.totalContributions,
          }"
        />

        <AchievementsSection
          v-if="profile.isClaimed || (profile.achievements && profile.achievements.length)"
          :badges="badges"
          :legacy-achievements="profile.achievements || []"
        />

        <ActivityGraph
          :username="profile.username"
          :is-claimed="profileStatus?.claimed || profile.isClaimed"
          :merged-data="formatContributionsForGraph()"
          :loading="contributionsLoading"
          :error="contributionsError"
          @retry="() => loadContributions(username)"
        />

        <StatsGrid :stats="profile.stats" />

        <ShareSection
          :profile="profile"
          :claimed-profile="claimedProfile"
          :share-stats="shareStats"
          @share="shareProfile"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuth0 } from '@auth0/auth0-vue'
import { useMeta } from '@/composables/useMeta'
import { useStyles } from '@/composables/useStyles'
import { useProfile } from '@/composables/useProfile'
import { useContributions } from '@/composables/useContributions'
import type { Profile } from '@/services/supabase'

// Components
import LoadingState from '@/components/profile/LoadingState.vue'
import ErrorState from '@/components/profile/ErrorState.vue'
import ProfileHeader from '@/components/profile/ProfileHeader.vue'
import SocialLinks from '@/components/profile/SocialLinks.vue'
import AchievementsSection from '@/components/profile/AchievementsSection.vue'
import StatsGrid from '@/components/profile/StatsGrid.vue'
import ShareSection from '@/components/profile/ShareSection.vue'
import AuthButton from '@/components/AuthButton.vue'
import ConnectedProviders from '@/components/ConnectedProviders.vue'
import ActivityGraph from '@/components/ActivityGraph.vue'

const route = useRoute()
const { updateMeta } = useMeta()
const { classes } = useStyles()

const username = computed(() => route.params.username as string)

let user = ref(null)
try {
  const auth0 = useAuth0()
  user = auth0.user
} catch (e) {
  console.log('Auth0 not available, continuing without it')
}

const { loading, error, profile, badges, profileStatus, fetchProfile } = useProfile(
  username.value,
  user.value?.sub
)

const { contributionsLoading, contributionsError, loadContributions, formatContributionsForGraph } =
  useContributions()

const claimedProfile = ref<Profile | null>(null)
const shareStats = ref<{ views: number; shares: number; clicks: number } | null>(null)

const bgGridClasses = computed(() => classes.bgGrid)
const backButtonClasses = computed(() =>
  'flex items-center gap-2 px-4 py-2 bg-gray-900/50 border border-green-500/30 rounded-lg hover:border-green-400 hover:bg-gray-800/70 transition-all duration-300 text-green-300 hover:text-green-200'
)

const handleFetchProfile = async () => {
  await fetchProfile()
  if (profileStatus.value?.claimed) {
    await loadContributions(username.value)
  }
}

watch(
  profile,
  async newProfile => {
    if (newProfile) {
      const statsObj = {
        repos: newProfile.stats.find((s: any) => s.label === 'Repositories')?.value || '0',
        stars:
          newProfile.stats.find((s: any) => s.label === 'Stars Earned' || s.label === 'Stars')?.value ||
          '0',
        contributions: newProfile.stats.find((s: any) => s.label === 'Total Contributions')?.value || '0',
      }

      await updateMeta({
        title: `${newProfile.displayName} (@${newProfile.username}) - DevHood`,
        description: `${newProfile.bio} | ${statsObj.repos} repos, ${statsObj.stars} stars, ${badges.value.filter(b => b.earned).length} achievements`,
        url: window.location.href,
        generateOgImage: newProfile.isClaimed,
        profile: newProfile.isClaimed
          ? {
              username: newProfile.username,
              displayName: newProfile.displayName,
              bio: newProfile.bio,
              avatar: newProfile.avatar,
              stats: statsObj,
              badgeCount: badges.value.filter(b => b.earned).length,
            }
          : undefined,
        image: !newProfile.isClaimed ? newProfile.avatar : undefined,
      })
    }
  },
  { immediate: true }
)

const shareProfile = async () => {
  const url = window.location.href
  const title = `Check out ${profile.value?.displayName}'s developer profile`

  if (navigator.share) {
    try {
      await navigator.share({
        title,
        text: `${profile.value?.bio}`,
        url,
      })
    } catch (err) {
      await copyToClipboard(url)
    }
  } else {
    await copyToClipboard(url)
  }
}

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    console.log('Profile URL copied to clipboard!')
  } catch (err) {
    console.error('Failed to copy URL')
  }
}

onMounted(async () => {
  await handleFetchProfile()

  if (profile.value?.isClaimed && profile.value.badges.length > 0) {
    const profileId = profile.value.badges[0].profile_id
    claimedProfile.value = {
      id: profileId,
      auth0_id: user.value?.sub || '',
      username: profile.value.username,
      display_name: profile.value.displayName,
      bio: profile.value.bio,
      avatar_url: profile.value.avatar,
      location: profile.value.location,
      company: profile.value.company,
      blog: profile.value.blog,
      twitter_username: profile.value.twitterUsername,
      email: '',
      is_claimed: true,
      github_username: profile.value.username,
      gitlab_username: undefined,
      created_at: profile.value.joinedDate,
      updated_at: new Date().toISOString(),
    } as Profile

    shareStats.value = {
      views: Math.floor(Math.random() * 500) + 100,
      shares: Math.floor(Math.random() * 50) + 10,
      clicks: Math.floor(Math.random() * 200) + 50,
    }
  }
})
</script>
