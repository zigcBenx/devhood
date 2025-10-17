import { ref } from 'vue'
import { apiService } from '@/services/api'

export const useContributions = () => {
  const contributionsData = ref<any>(null)
  const contributionsLoading = ref(false)
  const contributionsError = ref('')

  const loadContributions = async (username: string) => {
    contributionsLoading.value = true
    contributionsError.value = ''

    try {
      console.log('🔄 Loading contributions asynchronously...')
      const response = await apiService.getContributions(username)
      contributionsData.value = response.contributions
      console.log('✅ Fetched combined contributions:', contributionsData.value)
    } catch (error) {
      console.error('❌ Failed to fetch contributions:', error)
      contributionsError.value = error instanceof Error ? error.message : 'Failed to load contributions'
      contributionsData.value = null
    } finally {
      contributionsLoading.value = false
    }
  }

  const getContributionColor = (count: number) => {
    if (count === 0) return 'bg-gray-800 border-green-500/20'
    if (count <= 2) return 'bg-green-500/20 border-green-500/30'
    if (count <= 5) return 'bg-green-500/40 border-green-500/50'
    if (count <= 10) return 'bg-green-500/60 border-green-500/70'
    return 'bg-green-500/80 border-green-500'
  }

  const formatContributionsForGraph = () => {
    if (!contributionsData.value) return undefined

    const result: any = {}

    if (contributionsData.value.combined) {
      const combinedData = contributionsData.value.combined
      result.merged = {
        totalContributions: combinedData.total,
        weeks: formatDataAsWeeks(combinedData.data, 'total'),
        months: generateMonthLabels(),
      }
    }

    if (contributionsData.value.github) {
      const githubData = contributionsData.value.github
      result.github = {
        totalContributions: githubData.total,
        weeks: formatDataAsWeeks(githubData.data, 'github'),
        months: generateMonthLabels(),
      }
    }

    if (contributionsData.value.gitlab) {
      const gitlabData = contributionsData.value.gitlab
      result.gitlab = {
        totalContributions: gitlabData.total,
        weeks: formatDataAsWeeks(gitlabData.data, 'gitlab'),
        months: generateMonthLabels(),
      }
    }

    return result
  }

  const formatDataAsWeeks = (data: any[], type: 'total' | 'github' | 'gitlab') => {
    const today = new Date()
    const startDate = new Date(today)
    startDate.setFullYear(today.getFullYear() - 1)
    startDate.setDate(today.getDate() + 1)

    const contributionsByDate = new Map()
    data.forEach(day => contributionsByDate.set(day.date, day))

    const allDays = []
    const currentDate = new Date(startDate)

    while (currentDate <= today) {
      const dateStr = currentDate.toISOString().split('T')[0]
      const contribution = contributionsByDate.get(dateStr)
      const count = contribution
        ? type === 'total'
          ? contribution.total || contribution.count
          : type === 'github'
            ? contribution.github || contribution.count
            : contribution.gitlab || contribution.count
        : 0

      allDays.push({
        date: dateStr,
        contributionCount: count,
        intensity: Math.min(4, Math.floor(count / 3)),
        color: getContributionColor(count),
      })

      currentDate.setDate(currentDate.getDate() + 1)
    }

    // Format into weeks
    const weeks = []
    let paddedDays = [...allDays]
    const firstDayOfWeek = new Date(startDate).getDay()

    for (let i = 0; i < firstDayOfWeek; i++) {
      const padDate = new Date(startDate)
      padDate.setDate(startDate.getDate() - (firstDayOfWeek - i))
      paddedDays.unshift({
        date: padDate.toISOString().split('T')[0],
        contributionCount: 0,
        intensity: 0,
        color: getContributionColor(0),
      })
    }

    for (let i = 0; i < paddedDays.length; i += 7) {
      const weekDays = paddedDays.slice(i, i + 7)
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

  return {
    contributionsData,
    contributionsLoading,
    contributionsError,
    loadContributions,
    formatContributionsForGraph,
  }
}
