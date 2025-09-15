import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Profile {
  id: string
  auth0_id: string
  username: string
  display_name?: string
  bio?: string
  avatar_url?: string
  location?: string
  company?: string
  blog?: string
  twitter_username?: string
  email?: string
  is_claimed: boolean
  github_username?: string
  gitlab_username?: string
  created_at: string
  updated_at: string
}

export interface ProviderAccount {
  id: string
  profile_id: string
  provider: 'github' | 'gitlab'
  provider_account_id: string
  username: string
  access_token_encrypted?: string
  scope?: string
  connected_at: string
  last_sync_at?: string
}

export interface ActivityData {
  id: string
  profile_id: string
  date: string
  github_contributions: number
  gitlab_contributions: number
  total_contributions: number
  repositories_contributed: number
  created_at: string
}

export interface Repository {
  id: string
  profile_id: string
  provider: 'github' | 'gitlab'
  external_id: string
  name: string
  full_name: string
  description?: string
  language?: string
  stars_count: number
  forks_count: number
  is_fork: boolean
  is_private: boolean
  html_url?: string
  created_at_provider?: string
  updated_at_provider?: string
  last_activity?: string
  created_at: string
  updated_at: string
}

export interface Badge {
  id: string
  slug: string
  name: string
  description?: string
  icon?: string
  criteria_type: string
  criteria_threshold?: number
  criteria_timeframe?: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  is_active: boolean
  created_at: string
}

export interface UserBadge {
  id: string
  profile_id: string
  badge_id: string
  earned_at: string
  criteria_value?: number
  badge?: Badge
}

export interface ShareLink {
  id: string
  profile_id: string
  slug: string
  is_active: boolean
  view_count: number
  created_at: string
  expires_at?: string
}

// Supabase service class
export class SupabaseService {
  async getProfile(username: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', username)
      .single()

    if (error) {
      console.error('Error fetching profile:', error)
      return null
    }

    return data
  }

  async getProfileByAuth0Id(auth0Id: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('auth0_id', auth0Id)
      .single()

    if (error) {
      console.error('Error fetching profile by Auth0 ID:', error)
      return null
    }

    return data
  }

  async createProfile(profileData: Partial<Profile>): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .insert([profileData])
      .select()
      .single()

    if (error) {
      console.error('Error creating profile:', error)
      return null
    }

    return data
  }

  async updateProfile(id: string, updates: Partial<Profile>): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating profile:', error)
      return null
    }

    return data
  }

  async getProviderAccounts(profileId: string): Promise<ProviderAccount[]> {
    const { data, error } = await supabase
      .from('provider_accounts')
      .select('*')
      .eq('profile_id', profileId)

    if (error) {
      console.error('Error fetching provider accounts:', error)
      return []
    }

    return data || []
  }

  async addProviderAccount(accountData: Partial<ProviderAccount>): Promise<ProviderAccount | null> {
    const { data, error } = await supabase
      .from('provider_accounts')
      .insert([accountData])
      .select()
      .single()

    if (error) {
      console.error('Error adding provider account:', error)
      return null
    }

    return data
  }

  async getActivityData(profileId: string, limit: number = 365): Promise<ActivityData[]> {
    const { data, error } = await supabase
      .from('activity_data')
      .select('*')
      .eq('profile_id', profileId)
      .order('date', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching activity data:', error)
      return []
    }

    return data || []
  }

  async upsertActivityData(activityData: Partial<ActivityData>[]): Promise<boolean> {
    const { error } = await supabase
      .from('activity_data')
      .upsert(activityData, {
        onConflict: 'profile_id,date'
      })

    if (error) {
      console.error('Error upserting activity data:', error)
      return false
    }

    return true
  }

  async getRepositories(profileId: string): Promise<Repository[]> {
    const { data, error } = await supabase
      .from('repositories')
      .select('*')
      .eq('profile_id', profileId)
      .order('stars_count', { ascending: false })

    if (error) {
      console.error('Error fetching repositories:', error)
      return []
    }

    return data || []
  }

  async upsertRepositories(repositories: Partial<Repository>[]): Promise<boolean> {
    const { error } = await supabase
      .from('repositories')
      .upsert(repositories, {
        onConflict: 'provider,external_id'
      })

    if (error) {
      console.error('Error upserting repositories:', error)
      return false
    }

    return true
  }

  async getUserBadges(profileId: string): Promise<UserBadge[]> {
    const { data, error } = await supabase
      .from('user_badges')
      .select(`
        *,
        badge:badges(*)
      `)
      .eq('profile_id', profileId)
      .order('earned_at', { ascending: false })

    if (error) {
      console.error('Error fetching user badges:', error)
      return []
    }

    return data || []
  }

  async awardBadge(profileId: string, badgeId: string, criteriaValue?: number): Promise<UserBadge | null> {
    const { data, error } = await supabase
      .from('user_badges')
      .insert([{
        profile_id: profileId,
        badge_id: badgeId,
        criteria_value: criteriaValue
      }])
      .select(`
        *,
        badge:badges(*)
      `)
      .single()

    if (error) {
      console.error('Error awarding badge:', error)
      return null
    }

    return data
  }

  async getAllBadges(): Promise<Badge[]> {
    const { data, error } = await supabase
      .from('badges')
      .select('*')
      .eq('is_active', true)
      .order('rarity', { ascending: true })

    if (error) {
      console.error('Error fetching badges:', error)
      return []
    }

    return data || []
  }

  async createShareLink(profileId: string, slug: string): Promise<ShareLink | null> {
    const { data, error } = await supabase
      .from('share_links')
      .insert([{
        profile_id: profileId,
        slug: slug,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
      }])
      .select()
      .single()

    if (error) {
      console.error('Error creating share link:', error)
      return null
    }

    return data
  }

  async getProfileByShareSlug(slug: string): Promise<Profile | null> {
    const { data: shareLink, error: shareLinkError } = await supabase
      .from('share_links')
      .select(`
        profile_id,
        profiles:profiles(*)
      `)
      .eq('slug', slug)
      .eq('is_active', true)
      .single()

    if (shareLinkError || !shareLink) {
      console.error('Error fetching share link:', shareLinkError)
      return null
    }

    // Increment view count
    await supabase
      .from('share_links')
      .update({ view_count: supabase.raw('view_count + 1') })
      .eq('slug', slug)

    return shareLink.profiles as Profile
  }
}

export const supabaseService = new SupabaseService()