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
          <div class="flex gap-4">
            <button 
              @click="showWrapped = true"
              class="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-bold hover:opacity-90 transition-opacity animate-pulse"
            >
              Play DevWrapped ▶
            </button>
            <AuthButton />
          </div>
        </div>

        <ProfileHeader :profile="profile" :profile-status="profileStatus" />

        <SocialLinks :links="profile.socialLinks" :username="profile.username" />

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

        <DevWrapped 
          :is-open="showWrapped" 
          :slides="wrappedSlides" 
          @close="showWrapped = false" 
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
import DevWrapped from '@/components/DevWrapped.vue'

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
const showWrapped = ref(false)

const wrappedSlides = computed(() => {
  if (!profile.value) return []
  
  const p = profile.value
  const stats = p.stats || []
  const repos = stats.find((s: any) => s.label === 'Repositories')?.value || '0'
  const stars = stats.find((s: any) => s.label === 'Stars Earned' || s.label === 'Stars')?.value || '0'
  const contributions = stats.find((s: any) => s.label === 'Total Contributions')?.value || '0'
  const followers = stats.find((s: any) => s.label === 'Followers')?.value || '0'
  const topLanguage = p.topRepos?.[0]?.language || 'Code'
  
  // Fun fact calculations
  const locEstimate = parseInt(contributions.replace(/,/g, '')) * 20; // Rough estimate: 20 lines per contribution
  const booksWritten = Math.max(1, Math.floor(locEstimate / 10000)); // 10k lines per book approx
  const coffeeCups = Math.floor(parseInt(contributions.replace(/,/g, '')) * 0.5); // 0.5 cups per contribution

  return [
    {
      layout: 'intro',
      title: "2024 Unwrapped",
      subtitle: `For @${p.username}`,
      bgColor: "bg-gradient-to-br from-violet-900 via-purple-900 to-fuchsia-900",
      textColor: "text-white"
    },
    {
      layout: 'stat-big',
      title: "You were busy!",
      stat: contributions,
      statLabel: "Contributions",
      description: `That's enough code to fill ${booksWritten} Harry Potter books! 📚🧙‍♂️`,
      bgColor: "bg-gradient-to-br from-emerald-900 to-teal-900",
      textColor: "text-emerald-100"
    },
    {
      layout: 'stat-big',
      title: "Repo Machine",
      stat: repos,
      statLabel: "Public Repos",
      description: "You're building the future, one repo at a time. 🚀",
      bgColor: "bg-gradient-to-br from-blue-900 to-indigo-900",
      textColor: "text-blue-100"
    },
    {
      layout: 'rank',
      title: "Star Power",
      stat: stars,
      statLabel: "Stars Earned",
      rankIcon: "⭐",
      description: "You're basically a celebrity in the open source world.",
      bgColor: "bg-gradient-to-br from-amber-900 to-orange-900",
      textColor: "text-amber-100"
    },
    {
      layout: 'stat-big',
      title: "Main Character Energy",
      stat: topLanguage,
      statLabel: "Top Language",
      description: `You speak ${topLanguage} fluently. Impressive! 🗣️`,
      bgColor: "bg-gradient-to-br from-pink-900 to-rose-900",
      textColor: "text-rose-100"
    },
    {
      layout: 'stat-grid',
      title: "Community Stats",
      description: "You're building a tribe!",
      stats: [
        { label: 'Followers', value: followers },
        { label: 'Following', value: p.stats.find((s: any) => s.label === 'Following')?.value || '0' },
        { label: 'Coffees Consumed', value: `~${coffeeCups}` },
        { label: 'Bugs Created', value: '∞' }
      ],
      bgColor: "bg-gradient-to-br from-slate-900 to-gray-900",
      textColor: "text-gray-100"
    },
    {
      layout: 'outro',
      title: "That's a Wrap!",
      subtitle: "See you in 2025",
      stat: contributions, // Passing for summary
      description: topLanguage, // Passing for summary
      bgColor: "bg-black",
      textColor: "text-white"
    }
  ]
})

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

  if (profile.value?.isClaimed) {
    claimedProfile.value = {
      id: username.value,
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
