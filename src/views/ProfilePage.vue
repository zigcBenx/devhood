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

const { contributionsLoading, contributionsError, loadContributions, formatContributionsForGraph, contributionsData } =
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
  
  // Calculate detailed stats
  let activeDays = 0
  let maxStreak = 0
  let maxCommits = 0
  let bestDay = 'recently'
  
  if (contributionsData.value?.combined?.data) {
      const data = contributionsData.value.combined.data
      activeDays = data.filter((d: any) => (d.count || d.total) > 0).length
      
      let currentStreak = 0
      data.forEach((d: any) => {
          const count = d.count || d.total || 0
          if (count > 0) {
              currentStreak++
              if (currentStreak > maxStreak) maxStreak = currentStreak
              if (count > maxCommits) {
                  maxCommits = count
                  bestDay = new Date(d.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
              }
          } else {
              currentStreak = 0
          }
      })
  }

  // Fun fact calculations
  const locEstimate = parseInt(contributions.replace(/,/g, '')) * 20; 
  const booksWritten = Math.max(1, Math.floor(locEstimate / 10000)); 

  // Top Languages List
  const languages = p.topRepos?.slice(0, 3).map((repo: any) => ({
    label: repo.language || 'Code',
    value: repo.name
  })) || [{ label: topLanguage, value: 'Everywhere' }];

  // Personality Logic
  let personality = "The Builder";
  let personalityIcon = "👷";
  let personalityDesc = "You build things. Good things.";
  
  const contNum = parseInt(contributions.replace(/,/g, ''));
  if (contNum > 1000) {
    personality = "The Machine";
    personalityIcon = "🤖";
    personalityDesc = "Do you ever sleep? Seriously.";
  } else if (maxStreak > 30) {
    personality = "The Consistent";
    personalityIcon = "🏃";
    personalityDesc = "Slow and steady wins the race.";
  } else if (parseInt(stars) > 100) {
    personality = "The Star";
    personalityIcon = "⭐";
    personalityDesc = "People love what you do.";
  }

  return [
    // Slide 1: Opening Scene
    {
      layout: 'cinematic',
      title: "The Developer Awakens",
      description: `In 2025, you wrote ${contributions} lines of code, enough to fill ${booksWritten} Harry Potter books, ${Math.floor(locEstimate / 300)} Wikipedia pages, or exactly 1 frustrated senior engineer’s tears.`,
      bgColor: "bg-black",
      textColor: "text-green-500",
      bgEffect: 'hacker-profile',
      image: p.avatar,
      // Duration: 3s initial delay + (approx 50ms * char count) + 2s buffer
      duration: 3000 + (`In 2025, you wrote ${contributions} lines of code, enough to fill ${booksWritten} Harry Potter books, ${Math.floor(locEstimate / 300)} Wikipedia pages, or exactly 1 frustrated senior engineer’s tears.`.length * 50) + 2000
    },
    // Slide 2: The Project Hoarder
    {
      layout: 'cinematic',
      title: "The 'Final' Project",
      description: `You know when you said you'd stop creating new projects and focus on just one? You are currently juggling ${repos} repositories. The terminal determined that was a lie.`,
      bgColor: "bg-black",
      textColor: "text-green-500",
      bgEffect: 'unfinished-projects',
      image: p.avatar,
      duration: 3000 + (`You know when you said you'd stop creating new projects and focus on just one? You are currently juggling ${repos} repositories. The terminal determined that was a lie.`.length * 50) + 2000
    },
    // Slide 3: The Weapon of Choice
    {
      layout: 'cinematic',
      title: "The Weapon of Choice",
      description: `You pledged your allegiance to ${topLanguage}. Through merge conflicts and runtime errors, you stayed loyal. It's almost romantic. In a Stockholm Syndrome kind of way.`,
      bgColor: "bg-black",
      textColor: "text-green-500",
      bgEffect: 'languages',
      image: p.avatar,
      duration: 3000 + (`You pledged your allegiance to ${topLanguage}. Through merge conflicts and runtime errors, you stayed loyal. It's almost romantic. In a Stockholm Syndrome kind of way.`.length * 50) + 2000
    },
    // Slide 4: The Archives (Commit Message)
    {
      layout: 'cinematic',
      title: "The Archives",
      description: "Are you embarrassed by your commit naming conventions? We looked through your history... and the terminal found this gem...",
      highlightText: "fix stuff",
      bgColor: "bg-black",
      textColor: "text-green-500",
      bgEffect: 'archives',
      image: p.avatar,
      duration: 3000 + ("Are you embarrassed by your commit naming conventions? We looked through your history... and the terminal found this gem...".length * 50) + 4000 // Extra time for reveal
    },
    // Slide 5: Dangerous PR
    {
      layout: 'cinematic',
      title: "Living on the Edge",
      description: "We found a PR that touched 84 files. You bypassed the checks. You ignored the warnings. You are an agent of chaos.",
      highlightText: "Merged to Main",
      bgColor: "bg-black",
      textColor: "text-green-500",
      bgEffect: 'pull-requests',
      image: p.avatar,
      duration: 3000 + ("We found a PR that touched 84 files. You bypassed the checks. You ignored the warnings. You are an agent of chaos.".length * 50) + 4000
    },
    // Slide 6: Snippet of Shame
    {
      layout: 'code-snippet',
      title: "Snippet of Shame",
      codeContent: "// TODO: Fix this later\nif (true) {\n  try {\n    doMagic();\n  } catch (e) {\n    console.log(\"oops\");\n  }\n}",
      description: "We don't know what happened here. But we judge.",
      bgColor: "bg-gray-900",
      textColor: "text-green-400",
      bgEffect: 'code'
    },
    // Slide 7: Impact
    {
      layout: 'stat-big',
      title: "Butterfly Effect",
      stat: repos,
      statLabel: "Projects Touched",
      description: "Your code was seen by thousands. That's impact. 🦋",
      bgColor: "bg-gradient-to-br from-cyan-900 to-blue-900",
      textColor: "text-cyan-100",
      bgEffect: 'network'
    },
    // Slide 8: Personality
    {
      layout: 'rank',
      title: "Your Class",
      stat: personality,
      statLabel: "RPG Class",
      rankIcon: personalityIcon,
      description: personalityDesc,
      bgColor: "bg-gradient-to-br from-amber-900 to-yellow-900",
      textColor: "text-amber-100",
      bgEffect: 'stars'
    },
    // Slide 9: Emotional Arc
    {
      layout: 'intro',
      title: "The Journey",
      subtitle: "Chaotic. Brilliant. Yours.",
      description: "In 2025 you debugged, built, broke things, and fixed them.",
      bgColor: "bg-black",
      textColor: "text-white",
      bgEffect: 'confetti'
    },
    // Slide 10: Share
    {
      layout: 'outro',
      title: "You Survived 2025",
      subtitle: "This was your year.",
      stat: contributions, 
      description: topLanguage, 
      bgColor: "bg-black",
      textColor: "text-white",
      bgEffect: 'confetti'
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
