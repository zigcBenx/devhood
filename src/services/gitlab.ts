interface GitLabUser {
  id: number
  username: string
  name: string
  bio: string
  location: string
  public_email: string
  avatar_url: string
  web_url: string
  created_at: string
  followers: number
  following: number
}

interface GitLabProject {
  id: number
  name: string
  name_with_namespace: string
  description: string
  star_count: number
  forks_count: number
  default_branch: string
  web_url: string
  created_at: string
  last_activity_at: string
  visibility: string
}

interface GitLabEvent {
  id: number
  action_name: string
  target_type: string
  target_title: string
  created_at: string
  project_id: number
  author: {
    username: string
    avatar_url: string
  }
}

interface GitLabContribution {
  date: string
  count: number
}

export interface ProcessedGitLabProfile {
  username: string
  displayName: string
  bio: string
  avatar: string
  location?: string
  email?: string
  webUrl: string
  stats: {
    projects: number
    stars: number
    forks: number
    followers: number
  }
  topProjects: GitLabProject[]
  totalStars: number
  joinedDate: string
  contributions: GitLabContribution[]
}

class GitLabService {
  private baseUrl = 'https://gitlab.com/api/v4'
  
  async fetchUser(username: string, token?: string): Promise<GitLabUser> {
    const headers: Record<string, string> = {
      'Accept': 'application/json'
    }
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    
    const response = await fetch(`${this.baseUrl}/users?username=${username}`, {
      headers
    })
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('User not found')
      }
      if (response.status === 401) {
        throw new Error('GitLab API authentication failed')
      }
      if (response.status === 403) {
        throw new Error('GitLab API rate limit exceeded. Please try again later.')
      }
      throw new Error('Failed to fetch user data')
    }
    
    const users = await response.json()
    if (!users.length) {
      throw new Error('User not found')
    }
    
    return users[0]
  }
  
  async fetchUserProjects(userId: number, token?: string, perPage = 100): Promise<GitLabProject[]> {
    const headers: Record<string, string> = {
      'Accept': 'application/json'
    }
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    
    const response = await fetch(
      `${this.baseUrl}/users/${userId}/projects?sort=desc&order_by=star_count&per_page=${perPage}&visibility=public`,
      { headers }
    )
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('GitLab API authentication failed')
      }
      if (response.status === 403) {
        throw new Error('GitLab API rate limit exceeded. Please try again later.')
      }
      throw new Error('Failed to fetch projects')
    }
    
    return response.json()
  }
  
  async fetchUserEvents(userId: number, token?: string, perPage = 50): Promise<GitLabEvent[]> {
    const headers: Record<string, string> = {
      'Accept': 'application/json'
    }
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    
    const response = await fetch(
      `${this.baseUrl}/users/${userId}/events?per_page=${perPage}`,
      { headers }
    )
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('GitLab API authentication failed')
      }
      if (response.status === 403) {
        // Rate limit or private events, return empty array
        return []
      }
      throw new Error('Failed to fetch user events')
    }
    
    return response.json()
  }

  async fetchUserContributions(userId: number, token?: string): Promise<GitLabContribution[]> {
    // GitLab doesn't have a direct contributions API like GitHub
    // We'll simulate this by analyzing recent events
    try {
      const events = await this.fetchUserEvents(userId, token, 100)
      
      // Group events by date and count contributions
      const contributionMap = new Map<string, number>()
      
      events.forEach(event => {
        const date = event.created_at.split('T')[0] // Extract date part
        const currentCount = contributionMap.get(date) || 0
        
        // Count push events, merge requests, and issues as contributions
        if (['pushed to', 'opened', 'created', 'merged'].includes(event.action_name)) {
          contributionMap.set(date, currentCount + 1)
        }
      })
      
      // Convert to array format
      const contributions: GitLabContribution[] = []
      const now = new Date()
      
      // Generate data for the last year
      for (let i = 365; i >= 0; i--) {
        const date = new Date(now)
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split('T')[0]
        
        contributions.push({
          date: dateStr,
          count: contributionMap.get(dateStr) || 0
        })
      }
      
      return contributions
    } catch (error) {
      console.error('Error fetching GitLab contributions:', error)
      return []
    }
  }
  
  async getProfile(username: string, token?: string): Promise<ProcessedGitLabProfile> {
    try {
      const user = await this.fetchUser(username, token)
      const [projects, events] = await Promise.all([
        this.fetchUserProjects(user.id, token).catch(() => []),
        this.fetchUserEvents(user.id, token).catch(() => [])
      ])
      
      const contributions = await this.fetchUserContributions(user.id, token)
      
      return this.processProfile(user, projects, events, contributions)
    } catch (error) {
      throw error
    }
  }
  
  private processProfile(
    user: GitLabUser, 
    projects: GitLabProject[], 
    events: GitLabEvent[],
    contributions: GitLabContribution[]
  ): ProcessedGitLabProfile {
    const totalStars = projects.reduce((sum, project) => sum + project.star_count, 0)
    const totalForks = projects.reduce((sum, project) => sum + project.forks_count, 0)
    const topProjects = projects.slice(0, 6)
    
    return {
      username: user.username,
      displayName: user.name || user.username,
      bio: user.bio || 'No bio available',
      avatar: user.avatar_url,
      location: user.location,
      email: user.public_email,
      webUrl: user.web_url,
      stats: {
        projects: projects.length,
        stars: totalStars,
        forks: totalForks,
        followers: user.followers
      },
      topProjects,
      totalStars,
      joinedDate: user.created_at,
      contributions
    }
  }
}

export const gitlabService = new GitLabService()
export type { GitLabUser, GitLabProject, GitLabEvent, GitLabContribution }