<template>
  <div class="min-h-screen bg-black text-green-400 font-mono overflow-hidden relative">
    <!-- Animated background grid -->
    <div class="absolute inset-0 bg-[linear-gradient(rgba(0,255,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.03)_1px,transparent_1px)] bg-[size:20px_20px] animate-pulse"></div>
    
    <div class="relative z-10">
      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center min-h-screen">
        <div class="text-center">
          <div class="inline-block bg-gray-900/80 border border-green-500/30 rounded-lg p-6 backdrop-blur-sm">
            <div class="flex items-center gap-2 mb-4">
              <div class="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
              <div class="w-3 h-3 rounded-full bg-green-500 animate-pulse" style="animation-delay: 0.5s"></div>
              <div class="w-3 h-3 rounded-full bg-green-500 animate-pulse" style="animation-delay: 1s"></div>
            </div>
            <div class="text-green-400 text-lg font-mono mb-2">$ git fetch {{ username }}</div>
            <div class="text-green-300/60 text-sm">Loading developer profile...</div>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="flex items-center justify-center min-h-screen">
        <div class="text-center max-w-md">
          <div class="bg-gray-900/80 border border-red-500/30 rounded-lg p-8 backdrop-blur-sm">
            <div class="text-red-400 text-6xl mb-4">⚠️</div>
            <h2 class="text-2xl font-bold text-red-400 mb-4">Error 404</h2>
            <p class="text-red-300/80 mb-6">{{ error }}</p>
            <div class="flex gap-4 justify-center">
              <button
                @click="$router.push('/')"
                class="px-4 py-2 bg-green-500 text-black rounded-md hover:bg-green-400 transition-colors font-semibold"
              >
                ← Back Home
              </button>
              <button
                @click="fetchProfile"
                class="px-4 py-2 bg-gray-700 text-green-400 border border-green-500/30 rounded-md hover:border-green-400 transition-colors font-semibold"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Profile Content -->
      <div v-else-if="profile" class="container mx-auto px-6 py-12 max-w-6xl">
        <!-- Header with Back Button and Auth -->
        <div class="flex justify-between items-center mb-8">
          <button
            @click="$router.push('/')"
            class="flex items-center gap-2 px-4 py-2 bg-gray-900/50 border border-green-500/30 rounded-lg hover:border-green-400 hover:bg-gray-800/70 transition-all duration-300 text-green-300 hover:text-green-200"
          >
            ← Back to Home
          </button>
          
          <!-- Show auth button always when user is authenticated or for unclaimed profiles -->
          <AuthButton />
        </div>

        <!-- Hero Section -->
        <div class="text-center mb-16 space-y-8">
          <!-- Avatar with glitch effect -->
          <div class="relative inline-block group">
            <Avatar 
              class="h-40 w-40 mx-auto ring-4 ring-green-500/50 shadow-[0_0_30px_rgba(0,255,0,0.3)] transition-all duration-300 group-hover:ring-green-400 group-hover:shadow-[0_0_50px_rgba(0,255,0,0.5)]"
              :src="profile.avatar"
              :alt="profile.username"
              :fallback="profile.username.slice(0, 2).toUpperCase()"
            />
            <div class="absolute inset-0 bg-green-500/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
          
          <!-- Name with terminal aesthetic -->
          <div class="space-y-4">
            <h1 class="text-5xl md:text-6xl font-black mb-4 bg-gradient-to-r from-green-400 via-green-300 to-green-500 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(0,255,0,0.3)]">
              {{ profile.displayName }}
            </h1>
            <div class="flex items-center justify-center gap-2 text-2xl text-green-300">
              <span class="text-green-500">@</span>
              <span class="font-semibold tracking-wider">{{ profile.username }}</span>
              <div class="w-2 h-6 bg-green-400 animate-pulse ml-1"></div>
            </div>

            <!-- Profile Status Section -->
            <div class="flex justify-center mt-6">
              <!-- Profile is claimed -->
              <div v-if="profileStatus?.claimed" class="group flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-amber-500/20 to-orange-600/20 border border-amber-500/40 rounded-lg backdrop-blur-sm">
                <Crown class="h-5 w-5 text-amber-400" />
                <span class="text-lg font-semibold text-amber-300">
                  Profile Claimed
                </span>
                <div class="flex items-center gap-2 text-sm">
                  <span class="text-amber-300/70">Connected via:</span>
                  <div class="flex gap-2">
                    <Badge
                      v-for="connection in profileStatus.connections"
                      :key="connection.provider"
                      variant="secondary"
                      class="bg-amber-500/20 text-amber-200 border-amber-500/30"
                    >
                      {{ connection.provider }}
                    </Badge>
                  </div>
                </div>
              </div>

              <!-- Profile is not claimed -->
              <button
                v-else
                @click="$router.push(`/claim/${profile.username}`)"
                class="group flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-green-500/20 to-green-600/20 border border-green-500/40 rounded-lg hover:from-green-500/30 hover:to-green-600/30 hover:border-green-400 transition-all duration-300 hover:shadow-[0_0_25px_rgba(0,255,0,0.3)] backdrop-blur-sm"
              >
                <Crown class="h-5 w-5 text-yellow-400 group-hover:text-yellow-300 transition-colors" />
                <span class="text-lg font-semibold text-green-300 group-hover:text-green-200 transition-colors">
                  Claim This Profile
                </span>
                <div class="flex gap-1">
                  <div class="w-1 h-1 rounded-full bg-green-400 animate-pulse"></div>
                  <div class="w-1 h-1 rounded-full bg-green-400 animate-pulse" style="animation-delay: 0.5s"></div>
                  <div class="w-1 h-1 rounded-full bg-green-400 animate-pulse" style="animation-delay: 1s"></div>
                </div>
              </button>
            </div>
            <p class="text-xl text-green-200/80 max-w-3xl mx-auto leading-relaxed font-light tracking-wide">
              {{ profile.bio }}
            </p>
            
            <!-- Location & Company -->
            <div class="flex items-center justify-center gap-6 text-green-400/70">
              <div v-if="profile.location" class="flex items-center gap-2">
                <MapPin class="h-4 w-4" />
                <span>{{ profile.location }}</span>
              </div>
              <div v-if="profile.company" class="flex items-center gap-2">
                <Building class="h-4 w-4" />
                <span>{{ profile.company }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Social Links -->
        <div v-if="profile.socialLinks.length" class="flex justify-center gap-6 mb-16">
          <a
            v-for="link in profile.socialLinks"
            :key="link.platform"
            :href="link.url"
            target="_blank"
            rel="noopener noreferrer"
            class="group relative flex items-center gap-3 px-6 py-3 bg-gray-900/50 border border-green-500/30 rounded-lg hover:border-green-400 hover:bg-gray-800/70 transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,255,0,0.2)] backdrop-blur-sm"
          >
            <component :is="getIcon(link.icon)" class="h-6 w-6 text-green-400 group-hover:text-green-300 transition-all duration-300 group-hover:scale-110" />
            <span class="text-lg font-semibold text-green-300 group-hover:text-green-200 transition-colors">{{ link.platform }}</span>
            <div class="absolute inset-0 bg-green-500/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </a>
          <a 
            :href="`https://github.com/${profile.username}`"
            target="_blank"
            rel="noopener noreferrer"
            class="group relative flex items-center gap-3 px-6 py-3 bg-gray-900/50 border border-green-500/30 rounded-lg hover:border-green-400 hover:bg-gray-800/70 transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,255,0,0.2)] backdrop-blur-sm"
          >
            <Github class="h-6 w-6 text-green-400 group-hover:text-green-300 transition-all duration-300 group-hover:scale-110" />
            <span class="text-lg font-semibold text-green-300 group-hover:text-green-200 transition-colors">GitHub</span>
            <div class="absolute inset-0 bg-green-500/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </a>
        </div>

        <!-- Connected Providers Display -->
        <ConnectedProviders 
          v-if="profile.isClaimed && profile.providers.length" 
          :providers="profile.providers"
          :stats="{
            totalRepos: profile.mergedStats.totalRepositories,
            totalStars: profile.mergedStats.totalStars,
            totalContributions: profile.mergedStats.totalContributions
          }"
        />

        <!-- Achievement Badges -->
        <div v-if="profile.isClaimed && badges.length" class="mb-16">
          <h2 class="text-3xl font-bold mb-8 text-center text-green-400 tracking-wider">
            <span class="inline-block animate-pulse">[</span> ACHIEVEMENTS <span class="inline-block animate-pulse">]</span>
          </h2>
          <BadgeDisplay :badges="badges" />
        </div>

        <!-- Legacy Achievement Display (for unclaimed profiles) -->
        <div v-else-if="profile.achievements.length" class="mb-16">
          <h2 class="text-3xl font-bold mb-8 text-center text-green-400 tracking-wider">
            <span class="inline-block animate-pulse">[</span> ACHIEVEMENTS <span class="inline-block animate-pulse">]</span>
          </h2>
          <div class="flex justify-center gap-4 flex-wrap max-w-4xl mx-auto">
            <Badge
              v-for="(achievement, index) in profile.achievements"
              :key="achievement.name"
              variant="secondary"
              class="group relative px-6 py-3 text-base font-semibold bg-gray-900/60 border border-green-500/40 hover:border-green-400 transition-all duration-300 hover:shadow-[0_0_15px_rgba(0,255,0,0.3)] backdrop-blur-sm hover:scale-105 cursor-default"
              :style="{ animationDelay: `${index * 0.1}s` }"
            >
              <component :is="getIcon(achievement.icon)" class="h-5 w-5 mr-3 text-green-400 group-hover:text-green-300 transition-all duration-300 group-hover:rotate-12" />
              <span class="text-green-300 group-hover:text-green-200">{{ achievement.name }}</span>
              <div class="absolute inset-0 bg-green-500/5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Badge>
          </div>
        </div>

        <!-- Activity Graph -->
        <ActivityGraph
          :username="profile.username"
          :is-claimed="profileStatus?.claimed || profile.isClaimed"
          :merged-data="contributionsData ? formatContributionsForGraph() : (profile.isClaimed ? getMergedActivityData() : undefined)"
          :loading="contributionsLoading"
          :error="contributionsError"
          @retry="loadContributionsAsync"
        />

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card
            v-for="(stat, index) in profile.stats"
            :key="stat.label"
            class="group relative p-8 text-center bg-gray-900/40 border border-green-500/30 backdrop-blur-sm hover:border-green-400 hover:bg-gray-800/60 transition-all duration-500 hover:shadow-[0_0_40px_rgba(0,255,0,0.2)] hover:scale-105 cursor-default overflow-hidden"
            :style="{ animationDelay: `${index * 0.2}s` }"
          >
            <div class="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div class="absolute inset-0 bg-gradient-to-r from-transparent via-green-400/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out"></div>
            
            <div class="relative z-10">
              <div class="mb-6 relative">
                <component :is="getIcon(stat.icon)" class="h-12 w-12 mx-auto text-green-400 group-hover:text-green-300 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6" />
                <div class="absolute inset-0 bg-green-400/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <p class="text-4xl font-black mb-3 text-green-300 group-hover:text-green-200 transition-colors duration-300 font-mono tracking-wider">{{ stat.value }}</p>
              <p class="text-lg text-green-400/80 group-hover:text-green-300 transition-colors duration-300 font-semibold tracking-wide uppercase">{{ stat.label }}</p>
              
              <div class="mt-4 flex justify-center">
                <div class="h-px w-16 bg-gradient-to-r from-transparent via-green-400 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            </div>
          </Card>
        </div>

        <!-- Share Section -->
        <div class="mb-12">
          <ShareProfile 
            v-if="profile.isClaimed && claimedProfile"
            :profile="claimedProfile" 
            :shareStats="shareStats"
          />
          <div v-else class="text-center">
            <div class="inline-block bg-gray-900/60 border border-green-500/30 rounded-lg p-6 backdrop-blur-sm">
              <p class="text-green-300 text-lg mb-4">
                Your dev fingerprint. Want yours?
              </p>
              <div class="flex gap-4 justify-center">
                <button
                  @click="shareProfile"
                  class="px-6 py-2 bg-green-500 text-black rounded-md hover:bg-green-400 transition-colors font-semibold flex items-center gap-2"
                >
                  <Share class="h-4 w-4" />
                  Share Profile
                </button>
                <button
                  @click="$router.push('/')"
                  class="px-6 py-2 bg-gray-700 text-green-400 border border-green-500/30 rounded-md hover:border-green-400 transition-colors font-semibold"
                >
                  → devhood.dev
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuth0 } from '@auth0/auth0-vue'
import { profileService, type MergedProfile, type BadgeWithProgress } from '@/services/profile'
import { apiService } from '@/services/api'
import type { Profile } from '@/services/supabase'
import { useMeta } from '@/composables/useMeta'
import Avatar from '@/components/ui/avatar.vue'
import Badge from '@/components/ui/badge.vue'
import Card from '@/components/ui/card.vue'
import ActivityGraph from '@/components/ActivityGraph.vue'
import BadgeDisplay from '@/components/BadgeDisplay.vue'
import ShareProfile from '@/components/ShareProfile.vue'
import AuthButton from '@/components/AuthButton.vue'
import ConnectedProviders from '@/components/ConnectedProviders.vue'
import { 
  Github, 
  Globe, 
  Twitter,
  Moon, 
  Calendar,
  Activity,
  GitCommit,
  GitBranch,
  Star,
  Users,
  Shield,
  MapPin,
  Building,
  Crown,
  Share
} from 'lucide-vue-next'

const route = useRoute()
const username = computed(() => route.params.username as string)
const { updateMeta } = useMeta()

// Safely handle Auth0 - it might not be available
let user = ref(null)
try {
  const auth0 = useAuth0()
  user = auth0.user
} catch (e) {
  console.log('Auth0 not available, continuing without it')
}

const loading = ref(false)
const error = ref('')
const profile = ref<MergedProfile | null>(null)
const badges = ref<BadgeWithProgress[]>([])
const claimedProfile = ref<Profile | null>(null)
const shareStats = ref<{ views: number; shares: number; clicks: number } | null>(null)
const profileStatus = ref<{ claimed: boolean; connections: Array<{ provider: string; username: string }> } | null>(null)
const contributionsData = ref<any>(null)
const contributionsLoading = ref(false)
const contributionsError = ref('')

// Update meta tags when profile changes
watch(profile, async (newProfile: MergedProfile | null) => {
  if (newProfile) {
    const statsObj = {
      repos: newProfile.stats.find((s: any) => s.label === 'Repositories')?.value || '0',
      stars: newProfile.stats.find((s: any) => s.label === 'Stars Earned' || s.label === 'Stars')?.value || '0',
      contributions: newProfile.stats.find((s: any) => s.label === 'Total Contributions')?.value || '0'
    }

    await updateMeta({
      title: `${newProfile.displayName} (@${newProfile.username}) - DevHood`,
      description: `${newProfile.bio} | ${statsObj.repos} repos, ${statsObj.stars} stars, ${badges.value.filter(b => b.earned).length} achievements`,
      url: window.location.href,
      generateOgImage: newProfile.isClaimed,
      profile: newProfile.isClaimed ? {
        username: newProfile.username,
        displayName: newProfile.displayName,
        bio: newProfile.bio,
        avatar: newProfile.avatar,
        stats: statsObj,
        badgeCount: badges.value.filter(b => b.earned).length
      } : undefined,
      image: !newProfile.isClaimed ? newProfile.avatar : undefined
    })
  }
}, { immediate: true })

const iconMap = {
  Globe,
  Twitter,
  Moon,
  Calendar,
  Activity,
  GitCommit,
  GitBranch,
  Star,
  Users,
  Shield
}

const getIcon = (iconName: string) => {
  return iconMap[iconName as keyof typeof iconMap] || Globe
}

const loadContributionsAsync = async () => {
  contributionsLoading.value = true
  contributionsError.value = ''

  try {
    console.log('🔄 Loading contributions asynchronously...')
    const contributionsResponse = await apiService.getContributions(username.value)
    contributionsData.value = contributionsResponse.contributions
    console.log('✅ Fetched combined contributions:', contributionsData.value)
  } catch (contribError) {
    console.error('❌ Failed to fetch contributions:', contribError)
    contributionsError.value = contribError instanceof Error ? contribError.message : 'Failed to load contributions'
    contributionsData.value = null
  } finally {
    contributionsLoading.value = false
  }
}

const fetchProfile = async () => {
  loading.value = true
  error.value = ''

  try {
    // Check if profile is claimed via our database
    try {
      profileStatus.value = await apiService.getProfileStatus(username.value)
    } catch (statusErr) {
      console.log('Failed to check profile status:', statusErr)
      profileStatus.value = { claimed: false, connections: [] }
    }

    const userId = user.value?.sub
    profile.value = await profileService.getProfile(username.value, userId)

    // Start async contributions loading after profile loads
    if (profileStatus.value?.claimed) {
      // Don't await - let this load asynchronously
      loadContributionsAsync()
    }

    // If it's a claimed profile, load additional data
    if (profile.value.isClaimed) {
      badges.value = await profileService.getBadgesWithProgress(
        profile.value.badges.length > 0 ? profile.value.badges[0].profile_id : undefined
      )

      // Extract the base profile data for ShareProfile component
      if (profile.value.badges.length > 0) {
        const profileId = profile.value.badges[0].profile_id
        // In a real app, you'd have a method to get Profile from profileId
        claimedProfile.value = {
          id: profileId,
          auth0_id: userId || '',
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
          updated_at: new Date().toISOString()
        } as Profile

        // Mock share stats - in a real app you'd fetch this from Supabase
        shareStats.value = {
          views: Math.floor(Math.random() * 500) + 100,
          shares: Math.floor(Math.random() * 50) + 10,
          clicks: Math.floor(Math.random() * 200) + 50
        }
      }
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load profile'
  } finally {
    loading.value = false
  }
}

const formatJoinDate = (dateString: string) => {
  return new Date(dateString).getFullYear()
}

const shareProfile = async () => {
  const url = window.location.href
  const title = `Check out ${profile.value?.displayName}'s developer profile`
  
  if (navigator.share) {
    try {
      await navigator.share({
        title,
        text: `${profile.value?.bio}`,
        url
      })
    } catch (err) {
      // Fallback to clipboard
      copyToClipboard(url)
    }
  } else {
    copyToClipboard(url)
  }
}

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    // You could add a toast notification here
    console.log('Profile URL copied to clipboard!')
  } catch (err) {
    console.error('Failed to copy URL')
  }
}

const formatContributionsForGraph = () => {
  if (!contributionsData.value) {
    return undefined
  }

  const result: any = {}

  // Format combined data if available
  if (contributionsData.value.combined) {
    const combinedData = contributionsData.value.combined
    result.merged = {
      totalContributions: combinedData.total,
      weeks: formatDataAsWeeks(combinedData.data, 'total'),
      months: generateMonthLabels()
    }
  }

  // Format GitHub data if available
  if (contributionsData.value.github) {
    const githubData = contributionsData.value.github
    result.github = {
      totalContributions: githubData.total,
      weeks: formatDataAsWeeks(githubData.data, 'github'),
      months: generateMonthLabels()
    }
  }

  // Format GitLab data if available
  if (contributionsData.value.gitlab) {
    const gitlabData = contributionsData.value.gitlab
    result.gitlab = {
      totalContributions: gitlabData.total,
      weeks: formatDataAsWeeks(gitlabData.data, 'gitlab'),
      months: generateMonthLabels()
    }
  }

  return result
}

const formatDataAsWeeks = (data: any[], type: 'total' | 'github' | 'gitlab') => {
  // Calculate exact same date range as backend (365 days ending today)
  const today = new Date()
  const startDate = new Date(today)
  startDate.setFullYear(today.getFullYear() - 1)
  startDate.setDate(today.getDate() + 1) // Start from tomorrow last year

  // Create a map of contributions by date for quick lookup
  const contributionsByDate = new Map()
  data.forEach(day => {
    contributionsByDate.set(day.date, day)
  })

  // Generate all days from start date to today
  const allDays = []
  const currentDate = new Date(startDate)

  while (currentDate <= today) {
    const dateStr = currentDate.toISOString().split('T')[0]

    const contribution = contributionsByDate.get(dateStr)
    const count = contribution ?
      (type === 'total' ? contribution.total || contribution.count :
       type === 'github' ? contribution.github || contribution.count :
       contribution.gitlab || contribution.count) : 0

    allDays.push({
      date: dateStr,
      contributionCount: count,
      intensity: Math.min(4, Math.floor(count / 3)),
      color: getContributionColor(count)
    })

    currentDate.setDate(currentDate.getDate() + 1)
  }

  // Pad to start on Sunday (GitHub style)
  const weeks = []
  let paddedDays = [...allDays]

  // Find what day of week the first day is (0 = Sunday, 1 = Monday, etc.)
  const firstDayOfWeek = new Date(startDate).getDay()

  // Add empty days to start the first week on Sunday if needed
  for (let i = 0; i < firstDayOfWeek; i++) {
    const padDate = new Date(startDate)
    padDate.setDate(startDate.getDate() - (firstDayOfWeek - i))

    paddedDays.unshift({
      date: padDate.toISOString().split('T')[0],
      contributionCount: 0,
      intensity: 0,
      color: getContributionColor(0)
    })
  }

  // Group into weeks (7 days each, starting with Sunday)
  for (let i = 0; i < paddedDays.length; i += 7) {
    const weekDays = paddedDays.slice(i, i + 7)
    weeks.push({ contributionDays: weekDays })
  }

  return weeks
}

const getMergedActivityData = () => {
  if (!profile.value?.isClaimed || !profile.value.activityData) {
    return undefined
  }

  // Convert activity data to contribution format
  // This is a simplified version - in a real app you'd format this properly
  const contributionDays = profile.value.activityData.map(day => ({
    date: day.date,
    contributionCount: day.total_contributions,
    intensity: Math.min(4, Math.floor(day.total_contributions / 5)), // Scale 0-4
    color: getContributionColor(day.total_contributions),
    githubContributions: day.github_contributions,
    gitlabContributions: day.gitlab_contributions
  }))

  const totalContributions = profile.value.activityData.reduce((sum, day) => sum + day.total_contributions, 0)
  const githubTotal = profile.value.activityData.reduce((sum, day) => sum + day.github_contributions, 0)
  const gitlabTotal = profile.value.activityData.reduce((sum, day) => sum + day.gitlab_contributions, 0)

  return {
    merged: {
      totalContributions,
      weeks: formatAsWeeks(contributionDays, 'total'),
      months: generateMonthLabels()
    },
    github: githubTotal > 0 ? {
      totalContributions: githubTotal,
      weeks: formatAsWeeks(contributionDays, 'github'),
      months: generateMonthLabels()
    } : undefined,
    gitlab: gitlabTotal > 0 ? {
      totalContributions: gitlabTotal,
      weeks: formatAsWeeks(contributionDays, 'gitlab'),
      months: generateMonthLabels()
    } : undefined
  }
}

const getContributionColor = (count: number) => {
  if (count === 0) return 'bg-gray-800 border-green-500/20'
  if (count <= 2) return 'bg-green-500/20 border-green-500/30'
  if (count <= 5) return 'bg-green-500/40 border-green-500/50'
  if (count <= 10) return 'bg-green-500/60 border-green-500/70'
  return 'bg-green-500/80 border-green-500'
}

const formatAsWeeks = (days: any[], type: 'total' | 'github' | 'gitlab') => {
  // This is a simplified version - you'd need proper week formatting logic here
  const weeks = []
  const chunkSize = 7
  
  for (let i = 0; i < days.length; i += chunkSize) {
    const weekDays = days.slice(i, i + chunkSize).map(day => ({
      date: day.date,
      contributionCount: type === 'total' ? day.contributionCount : 
                        type === 'github' ? day.githubContributions : day.gitlabContributions,
      intensity: type === 'total' ? day.intensity : 
                Math.min(4, Math.floor((type === 'github' ? day.githubContributions : day.gitlabContributions) / 5)),
      color: type === 'total' ? day.color : 
            getContributionColor(type === 'github' ? day.githubContributions : day.gitlabContributions)
    }))
    
    weeks.push({ contributionDays: weekDays })
  }
  
  return weeks
}

const generateMonthLabels = () => {
  const months = []
  const now = new Date()
  for (let i = 11; i >= 0; i--) {
    const month = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push(month.toLocaleDateString('en', { month: 'short' }))
  }
  return months
}

onMounted(() => {
  fetchProfile()
})
</script>