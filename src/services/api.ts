const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    const response = await fetch(url, config)

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(error.error || error.message || 'Request failed')
    }

    return response.json()
  }

  // GitHub OAuth
  async getGitHubOAuthUrl(username: string): Promise<{ url: string }> {
    return this.request(`/auth/github/url/${username}`)
  }

  async connectGitHub(code: string, username: string): Promise<any> {
    return this.request('/auth/github/connect', {
      method: 'POST',
      body: JSON.stringify({ code, username })
    })
  }

  // GitLab OAuth
  async getGitLabOAuthUrl(username: string): Promise<{ url: string }> {
    return this.request(`/auth/gitlab/url/${username}`)
  }

  async connectGitLab(code: string, username: string): Promise<any> {
    return this.request('/auth/gitlab/connect', {
      method: 'POST',
      body: JSON.stringify({ code, username })
    })
  }

  // Get stored connection data
  async getConnections(username: string): Promise<any> {
    return this.request(`/auth/connections/${username}`)
  }

  // Profile management
  async claimProfile(username: string, data: {
    settings: any
    githubData?: any
    gitlabData?: any
  }): Promise<any> {
    return this.request(`/profile/claim/${username}`, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async getProfileStatus(username: string): Promise<{
    claimed: boolean
    username: string
    profile?: {
      id: number
      display_name: string
      bio: string
      location: string
      website: string
      avatar_url: string
      claimed_at: string
    }
    connections: Array<{
      provider: string
      username: string
    }>
  }> {
    return this.request(`/auth/profile/${username}/status`)
  }

  async updateProfileSettings(username: string, settings: any): Promise<any> {
    return this.request(`/profile/settings/${username}`, {
      method: 'PUT',
      body: JSON.stringify({ settings })
    })
  }

  async getContributions(username: string): Promise<{
    success: boolean
    contributions: {
      github: { total: number; data: Array<{ date: string; count: number; platform: string }> } | null
      gitlab: { total: number; data: Array<{ date: string; count: number; platform: string }> } | null
      combined: {
        total: number
        githubTotal: number
        gitlabTotal: number
        data: Array<{ date: string; github: number; gitlab: number; total: number; intensity: number }>
      } | null
    }
    lastUpdated: string
  }> {
    return this.request(`/profile/contributions/${username}`)
  }

  // Asset generation
  getAssetUrl(username: string, type: 'card' | 'graph' | 'stats', format: 'png' | 'svg', params?: Record<string, string>): string {
    const searchParams = new URLSearchParams(params)
    return `${API_BASE_URL}/assets/${type}/${username}/${format}?${searchParams.toString()}`
  }
}

export const apiService = new ApiService()