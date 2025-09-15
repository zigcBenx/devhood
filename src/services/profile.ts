import { githubService, type ProcessedProfile as GitHubProfile } from './github'
import { gitlabService, type ProcessedGitLabProfile } from './gitlab'
import { supabaseService, type Profile, type UserBadge, type ActivityData, type Repository } from './supabase'

export interface MergedProfile extends GitHubProfile {
  isClaimed: boolean
  isOwner?: boolean
  badges: UserBadge[]
  mergedStats: {
    totalContributions: number
    contributionStreak: number
    totalRepositories: number
    totalStars: number
    totalForks: number
    githubContributions: number
    gitlabContributions: number
    languages: string[]
  }
  activityData: ActivityData[]
  repositories: Repository[]
  providers: ('github' | 'gitlab')[]
}

export interface BadgeWithProgress {
  id: string
  slug: string
  name: string
  description: string
  icon: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  earned: boolean
  earnedAt?: string
  progress?: number
}

class ProfileService {
  async getProfile(username: string, userId?: string): Promise<MergedProfile> {
    // First, check if this profile is claimed in our database
    const claimedProfile = await supabaseService.getProfile(username)
    
    if (claimedProfile && claimedProfile.is_claimed) {
      // Return merged profile from our database
      return this.getMergedClaimedProfile(claimedProfile, userId)
    } else {
      // Fallback to GitHub-only profile
      const githubProfile = await githubService.getProfile(username)
      return this.enhanceGitHubProfile(githubProfile)
    }
  }

  private async getMergedClaimedProfile(profile: Profile, currentUserId?: string): Promise<MergedProfile> {
    // Get user's badges
    const badges = await supabaseService.getUserBadges(profile.id)
    
    // Get activity data
    const activityData = await supabaseService.getActivityData(profile.id)
    
    // Get repositories
    const repositories = await supabaseService.getRepositories(profile.id)
    
    // Get provider accounts to know which platforms are connected
    const providerAccounts = await supabaseService.getProviderAccounts(profile.id)
    const providers = providerAccounts.map(acc => acc.provider)
    
    // Calculate merged stats
    const mergedStats = this.calculateMergedStats(activityData, repositories)
    
    // Build the merged profile
    const mergedProfile: MergedProfile = {
      username: profile.username,
      displayName: profile.display_name || profile.username,
      bio: profile.bio || 'No bio available',
      avatar: profile.avatar_url || '',
      location: profile.location,
      company: profile.company,
      blog: profile.blog,
      twitterUsername: profile.twitter_username,
      socialLinks: this.buildSocialLinks(profile, providers),
      stats: this.buildMergedStatsDisplay(mergedStats),
      achievements: badges.map(badge => ({
        name: badge.badge?.name || 'Achievement',
        icon: badge.badge?.icon || 'Star'
      })),
      topRepos: [], // This would be built from repositories
      totalStars: mergedStats.totalStars,
      joinedDate: profile.created_at,
      isClaimed: true,
      isOwner: currentUserId === profile.auth0_id,
      badges,
      mergedStats,
      activityData,
      repositories,
      providers: providers as ('github' | 'gitlab')[]
    }

    return mergedProfile
  }

  private enhanceGitHubProfile(githubProfile: GitHubProfile): MergedProfile {
    return {
      ...githubProfile,
      isClaimed: false,
      badges: [],
      mergedStats: {
        totalContributions: 0, // Would need to calculate from GitHub API
        contributionStreak: 0,
        totalRepositories: githubProfile.topRepos.length,
        totalStars: githubProfile.totalStars,
        totalForks: 0,
        githubContributions: 0,
        gitlabContributions: 0,
        languages: []
      },
      activityData: [],
      repositories: [],
      providers: ['github']
    }
  }

  private calculateMergedStats(activityData: ActivityData[], repositories: Repository[]) {
    const totalGithubContributions = activityData.reduce((sum, day) => sum + day.github_contributions, 0)
    const totalGitlabContributions = activityData.reduce((sum, day) => sum + day.gitlab_contributions, 0)
    const totalContributions = totalGithubContributions + totalGitlabContributions
    
    // Calculate contribution streak
    let streak = 0
    let currentStreak = 0
    const sortedData = activityData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    
    for (const day of sortedData) {
      if (day.total_contributions > 0) {
        currentStreak++
        streak = Math.max(streak, currentStreak)
      } else {
        currentStreak = 0
      }
    }

    const totalStars = repositories.reduce((sum, repo) => sum + repo.stars_count, 0)
    const totalForks = repositories.reduce((sum, repo) => sum + repo.forks_count, 0)
    const languages = [...new Set(repositories.filter(repo => repo.language).map(repo => repo.language!))]

    return {
      totalContributions,
      contributionStreak: streak,
      totalRepositories: repositories.length,
      totalStars,
      totalForks,
      githubContributions: totalGithubContributions,
      gitlabContributions: totalGitlabContributions,
      languages
    }
  }

  private buildSocialLinks(profile: Profile, providers: string[]) {
    const links = []
    
    if (profile.blog) {
      links.push({
        platform: 'Website',
        url: profile.blog.startsWith('http') ? profile.blog : `https://${profile.blog}`,
        icon: 'Globe'
      })
    }
    
    if (profile.twitter_username) {
      links.push({
        platform: 'Twitter',
        url: `https://twitter.com/${profile.twitter_username}`,
        icon: 'Twitter'
      })
    }
    
    if (providers.includes('github') && profile.github_username) {
      links.push({
        platform: 'GitHub',
        url: `https://github.com/${profile.github_username}`,
        icon: 'Github'
      })
    }
    
    if (providers.includes('gitlab') && profile.gitlab_username) {
      links.push({
        platform: 'GitLab',
        url: `https://gitlab.com/${profile.gitlab_username}`,
        icon: 'GitlabIcon'
      })
    }

    return links
  }

  private buildMergedStatsDisplay(stats: any) {
    return [
      {
        label: 'Total Contributions',
        value: stats.totalContributions.toLocaleString(),
        icon: 'Activity'
      },
      {
        label: 'Repositories',
        value: stats.totalRepositories.toLocaleString(),
        icon: 'GitBranch'
      },
      {
        label: 'Stars Earned',
        value: stats.totalStars.toLocaleString(),
        icon: 'Star'
      },
      {
        label: 'Languages',
        value: stats.languages.length.toString(),
        icon: 'Code'
      }
    ]
  }

  async getBadgesWithProgress(profileId?: string): Promise<BadgeWithProgress[]> {
    const allBadges = await supabaseService.getAllBadges()
    const userBadges = profileId ? await supabaseService.getUserBadges(profileId) : []
    const earnedBadgeIds = new Set(userBadges.map(ub => ub.badge_id))

    return allBadges.map(badge => ({
      id: badge.id,
      slug: badge.slug,
      name: badge.name,
      description: badge.description || '',
      icon: badge.icon || 'Star',
      rarity: badge.rarity,
      earned: earnedBadgeIds.has(badge.id),
      earnedAt: userBadges.find(ub => ub.badge_id === badge.id)?.earned_at,
      progress: this.calculateBadgeProgress(badge, profileId) // Would implement based on current stats
    }))
  }

  private calculateBadgeProgress(badge: any, profileId?: string): number | undefined {
    // This would calculate the user's progress toward earning this badge
    // Based on their current activity data and stats
    // For now, return a random progress value for unearned badges
    if (!profileId) return undefined
    
    return Math.random() * 100
  }
}

export const profileService = new ProfileService()