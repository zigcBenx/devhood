import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

interface GitHubUser {
  login: string
  id: number
  avatar_url: string
  name: string
  bio: string
  company: string
  location: string
  email: string
  public_repos: number
  followers: number
  following: number
  created_at: string
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
  created_at: string
  updated_at: string
  fork: boolean
  private: boolean
}

interface GitLabUser {
  id: number
  username: string
  name: string
  bio: string
  location: string
  public_email: string
  avatar_url: string
  created_at: string
}

interface GitLabProject {
  id: number
  name: string
  name_with_namespace: string
  description: string
  star_count: number
  forks_count: number
  web_url: string
  created_at: string
  last_activity_at: string
  visibility: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { profileId, providers } = await req.json()

    if (!profileId || !providers) {
      return new Response(
        JSON.stringify({ error: 'Missing profileId or providers' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get provider accounts for this profile
    const { data: providerAccounts, error: providerError } = await supabase
      .from('provider_accounts')
      .select('*')
      .eq('profile_id', profileId)

    if (providerError) {
      throw providerError
    }

    const results = {
      github: null as any,
      gitlab: null as any,
      activityData: [] as any[],
      repositories: [] as any[]
    }

    // Sync GitHub data
    const githubAccount = providerAccounts.find(acc => acc.provider === 'github')
    if (githubAccount && providers.github?.access_token) {
      try {
        const githubData = await syncGitHubData(githubAccount.username, providers.github.access_token)
        results.github = githubData
        
        // Add GitHub repositories to the results
        results.repositories.push(...githubData.repositories.map((repo: any) => ({
          profile_id: profileId,
          provider: 'github',
          external_id: repo.id.toString(),
          name: repo.name,
          full_name: repo.full_name,
          description: repo.description,
          language: repo.language,
          stars_count: repo.stargazers_count,
          forks_count: repo.forks_count,
          is_fork: repo.fork,
          is_private: repo.private,
          html_url: repo.html_url,
          created_at_provider: repo.created_at,
          updated_at_provider: repo.updated_at,
          last_activity: repo.updated_at
        })))
        
      } catch (error) {
        console.error('GitHub sync error:', error)
      }
    }

    // Sync GitLab data
    const gitlabAccount = providerAccounts.find(acc => acc.provider === 'gitlab')
    if (gitlabAccount && providers.gitlab?.access_token) {
      try {
        const gitlabData = await syncGitLabData(gitlabAccount.username, providers.gitlab.access_token)
        results.gitlab = gitlabData
        
        // Add GitLab repositories to the results
        results.repositories.push(...gitlabData.projects.map((project: any) => ({
          profile_id: profileId,
          provider: 'gitlab',
          external_id: project.id.toString(),
          name: project.name,
          full_name: project.name_with_namespace,
          description: project.description,
          language: null, // GitLab doesn't provide primary language in the same way
          stars_count: project.star_count,
          forks_count: project.forks_count,
          is_fork: false, // GitLab API doesn't directly indicate forks
          is_private: project.visibility === 'private',
          html_url: project.web_url,
          created_at_provider: project.created_at,
          updated_at_provider: project.last_activity_at,
          last_activity: project.last_activity_at
        })))
        
      } catch (error) {
        console.error('GitLab sync error:', error)
      }
    }

    // Merge activity data from both platforms
    const mergedActivity = mergeActivityData(results.github?.contributions || [], results.gitlab?.contributions || [])
    results.activityData = mergedActivity.map(activity => ({
      profile_id: profileId,
      date: activity.date,
      github_contributions: activity.github,
      gitlab_contributions: activity.gitlab,
      total_contributions: activity.total,
      repositories_contributed: activity.repos
    }))

    // Store repositories in database
    if (results.repositories.length > 0) {
      const { error: repoError } = await supabase
        .from('repositories')
        .upsert(results.repositories, {
          onConflict: 'provider,external_id'
        })

      if (repoError) {
        console.error('Error storing repositories:', repoError)
      }
    }

    // Store activity data
    if (results.activityData.length > 0) {
      const { error: activityError } = await supabase
        .from('activity_data')
        .upsert(results.activityData, {
          onConflict: 'profile_id,date'
        })

      if (activityError) {
        console.error('Error storing activity data:', activityError)
      }
    }

    // Update last sync time for provider accounts
    const syncTime = new Date().toISOString()
    for (const account of providerAccounts) {
      await supabase
        .from('provider_accounts')
        .update({ last_sync_at: syncTime })
        .eq('id', account.id)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: {
          repositories: results.repositories.length,
          activityDays: results.activityData.length,
          github: !!results.github,
          gitlab: !!results.gitlab
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error in sync-user-data function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

async function syncGitHubData(username: string, accessToken: string) {
  const headers = {
    'Authorization': `Bearer ${accessToken}`,
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'DevHood-App'
  }

  // Fetch user data
  const userResponse = await fetch(`https://api.github.com/users/${username}`, { headers })
  if (!userResponse.ok) throw new Error('Failed to fetch GitHub user data')
  const user: GitHubUser = await userResponse.json()

  // Fetch repositories
  const reposResponse = await fetch(`https://api.github.com/users/${username}/repos?sort=stars&per_page=100`, { headers })
  if (!reposResponse.ok) throw new Error('Failed to fetch GitHub repositories')
  const repositories: GitHubRepo[] = await reposResponse.json()

  // Fetch contribution data (simplified - in reality you'd use GraphQL)
  const contributions = await fetchGitHubContributions(username, accessToken)

  return {
    user,
    repositories,
    contributions
  }
}

async function syncGitLabData(username: string, accessToken: string) {
  const headers = {
    'Authorization': `Bearer ${accessToken}`,
    'Accept': 'application/json'
  }

  // Fetch user data
  const userResponse = await fetch(`https://gitlab.com/api/v4/users?username=${username}`, { headers })
  if (!userResponse.ok) throw new Error('Failed to fetch GitLab user data')
  const users = await userResponse.json()
  if (!users.length) throw new Error('GitLab user not found')
  const user: GitLabUser = users[0]

  // Fetch projects
  const projectsResponse = await fetch(`https://gitlab.com/api/v4/users/${user.id}/projects?sort=desc&order_by=star_count&per_page=100&visibility=public`, { headers })
  if (!projectsResponse.ok) throw new Error('Failed to fetch GitLab projects')
  const projects: GitLabProject[] = await projectsResponse.json()

  // Fetch contribution data (simplified)
  const contributions = await fetchGitLabContributions(user.id, accessToken)

  return {
    user,
    projects,
    contributions
  }
}

async function fetchGitHubContributions(username: string, accessToken: string) {
  // This is a simplified version - in reality you'd use GitHub's GraphQL API
  // for the contributionsCollection field
  const contributions = []
  const now = new Date()
  
  // Generate mock data for the last year
  for (let i = 365; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    
    contributions.push({
      date: dateStr,
      count: Math.floor(Math.random() * 10) // Mock data - replace with real API call
    })
  }
  
  return contributions
}

async function fetchGitLabContributions(userId: number, accessToken: string) {
  // Fetch recent events and approximate contributions
  const headers = {
    'Authorization': `Bearer ${accessToken}`,
    'Accept': 'application/json'
  }

  const contributions = []
  const now = new Date()
  
  // Generate mock data for the last year
  for (let i = 365; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    
    contributions.push({
      date: dateStr,
      count: Math.floor(Math.random() * 5) // Mock data - replace with real API call
    })
  }
  
  return contributions
}

function mergeActivityData(githubContributions: any[], gitlabContributions: any[]) {
  const merged = new Map()
  
  // Process GitHub contributions
  githubContributions.forEach(contrib => {
    merged.set(contrib.date, {
      date: contrib.date,
      github: contrib.count,
      gitlab: 0,
      total: contrib.count,
      repos: contrib.count > 0 ? 1 : 0
    })
  })
  
  // Add GitLab contributions
  gitlabContributions.forEach(contrib => {
    const existing = merged.get(contrib.date) || {
      date: contrib.date,
      github: 0,
      gitlab: 0,
      total: 0,
      repos: 0
    }
    
    existing.gitlab = contrib.count
    existing.total = existing.github + contrib.count
    existing.repos = Math.max(existing.repos, contrib.count > 0 ? 1 : 0)
    
    merged.set(contrib.date, existing)
  })
  
  return Array.from(merged.values()).sort((a, b) => a.date.localeCompare(b.date))
}