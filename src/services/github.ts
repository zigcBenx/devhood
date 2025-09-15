interface GitHubUser {
  login: string
  id: number
  avatar_url: string
  name: string
  bio: string
  company: string
  blog: string
  location: string
  email: string
  twitter_username: string
  public_repos: number
  public_gists: number
  followers: number
  following: number
  created_at: string
  updated_at: string
}

interface GitHubRepo {
  id: number
  name: string
  full_name: string
  description: string
  stargazers_count: number
  forks_count: number
  language: string
  html_url: string
  updated_at: string
}

interface GitHubEvent {
  id: string
  type: string
  actor: {
    login: string
    avatar_url: string
  }
  repo: {
    name: string
    url: string
  }
  created_at: string
  payload: any
}

export interface ProcessedProfile {
  username: string
  displayName: string
  bio: string
  avatar: string
  location?: string
  company?: string
  blog?: string
  twitterUsername?: string
  socialLinks: Array<{
    platform: string
    url: string
    icon: any
  }>
  stats: Array<{
    label: string
    value: string
    icon: any
  }>
  achievements: Array<{
    name: string
    icon: any
  }>
  topRepos: GitHubRepo[]
  totalStars: number
  joinedDate: string
}

class GitHubService {
  private baseUrl = 'https://api.github.com'
  
  async fetchUser(username: string): Promise<GitHubUser> {
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json'
    }
    
    // Add token if available for higher rate limits and better reliability
    const token = import.meta.env.VITE_GITHUB_TOKEN
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    
    const response = await fetch(`${this.baseUrl}/users/${username}`, {
      headers
    })
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('User not found')
      }
      if (response.status === 401) {
        throw new Error('GitHub API authentication failed')
      }
      if (response.status === 403) {
        throw new Error('GitHub API rate limit exceeded. Please try again later.')
      }
      throw new Error('Failed to fetch user data')
    }
    
    return response.json()
  }
  
  async fetchUserRepos(username: string, perPage = 100): Promise<GitHubRepo[]> {
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json'
    }
    
    // Add token if available for higher rate limits and better reliability
    const token = import.meta.env.VITE_GITHUB_TOKEN
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    
    const response = await fetch(`${this.baseUrl}/users/${username}/repos?sort=stars&per_page=${perPage}`, {
      headers
    })
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('GitHub API authentication failed')
      }
      if (response.status === 403) {
        throw new Error('GitHub API rate limit exceeded. Please try again later.')
      }
      throw new Error('Failed to fetch repositories')
    }
    
    return response.json()
  }
  
  async fetchUserEvents(username: string, perPage = 30): Promise<GitHubEvent[]> {
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json'
    }
    
    // Add token if available for higher rate limits and better reliability
    const token = import.meta.env.VITE_GITHUB_TOKEN
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    
    const response = await fetch(`${this.baseUrl}/users/${username}/events/public?per_page=${perPage}`, {
      headers
    })
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('GitHub API authentication failed')
      }
      if (response.status === 403) {
        // Rate limit or private events, return empty array
        return []
      }
      throw new Error('Failed to fetch user events')
    }
    
    return response.json()
  }
  
  async getProfile(username: string): Promise<ProcessedProfile> {
    try {
      const [user, repos, events] = await Promise.all([
        this.fetchUser(username),
        this.fetchUserRepos(username),
        this.fetchUserEvents(username).catch(() => [])
      ])
      
      return this.processProfile(user, repos, events)
    } catch (error) {
      throw error
    }
  }
  
  private processProfile(user: GitHubUser, repos: GitHubRepo[], events: GitHubEvent[]): ProcessedProfile {
    const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0)
    const topRepos = repos.slice(0, 6)
    
    // Calculate achievements based on activity
    const achievements = this.calculateAchievements(user, repos, events)
    
    // Build social links
    const socialLinks = []
    if (user.blog) {
      socialLinks.push({
        platform: 'Website',
        url: user.blog.startsWith('http') ? user.blog : `https://${user.blog}`,
        icon: 'Globe'
      })
    }
    if (user.twitter_username) {
      socialLinks.push({
        platform: 'Twitter',
        url: `https://twitter.com/${user.twitter_username}`,
        icon: 'Twitter'
      })
    }
    
    return {
      username: user.login,
      displayName: user.name || user.login,
      bio: user.bio || 'No bio available',
      avatar: user.avatar_url,
      location: user.location,
      company: user.company,
      blog: user.blog,
      twitterUsername: user.twitter_username,
      socialLinks,
      stats: [
        {
          label: 'Repositories',
          value: user.public_repos.toLocaleString(),
          icon: 'GitBranch'
        },
        {
          label: 'Stars Earned',
          value: totalStars.toLocaleString(),
          icon: 'Star'
        },
        {
          label: 'Followers',
          value: user.followers.toLocaleString(),
          icon: 'Users'
        }
      ],
      achievements,
      topRepos,
      totalStars,
      joinedDate: user.created_at
    }
  }
  
  private calculateAchievements(user: GitHubUser, repos: GitHubRepo[], events: GitHubEvent[]): Array<{name: string, icon: any}> {
    const achievements = []
    
    // Night Owl - based on recent commit times (simulated for now)
    const nightCommits = events.filter(event => 
      event.type === 'PushEvent' && 
      new Date(event.created_at).getHours() >= 22 || new Date(event.created_at).getHours() <= 6
    )
    
    if (nightCommits.length > 3) {
      achievements.push({ name: 'Night Owl', icon: 'Moon' })
    }
    
    // Popular Developer
    if (user.followers > 100) {
      achievements.push({ name: 'Popular Dev', icon: 'Users' })
    }
    
    // Prolific Contributor
    if (user.public_repos > 50) {
      achievements.push({ name: 'Prolific', icon: 'GitCommit' })
    }
    
    // Star Collector
    const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0)
    if (totalStars > 500) {
      achievements.push({ name: 'Star Collector', icon: 'Star' })
    }
    
    // Veteran Developer
    const accountAge = new Date().getFullYear() - new Date(user.created_at).getFullYear()
    if (accountAge >= 5) {
      achievements.push({ name: 'Veteran', icon: 'Shield' })
    }
    
    // Weekend Warrior
    const weekendEvents = events.filter(event => {
      const day = new Date(event.created_at).getDay()
      return day === 0 || day === 6 // Sunday or Saturday
    })
    
    if (weekendEvents.length > 5) {
      achievements.push({ name: 'Weekend Warrior', icon: 'Calendar' })
    }
    
    return achievements
  }
}

export const githubService = new GitHubService()
export type { GitHubUser, GitHubRepo, GitHubEvent }