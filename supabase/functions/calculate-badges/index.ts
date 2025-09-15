import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { profileId } = await req.json()

    if (!profileId) {
      return new Response(
        JSON.stringify({ error: 'Missing profileId' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get profile data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', profileId)
      .single()

    if (profileError || !profile) {
      throw new Error('Profile not found')
    }

    // Get activity data for the last year
    const oneYearAgo = new Date()
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
    
    const { data: activityData, error: activityError } = await supabase
      .from('activity_data')
      .select('*')
      .eq('profile_id', profileId)
      .gte('date', oneYearAgo.toISOString().split('T')[0])

    if (activityError) {
      throw new Error('Failed to fetch activity data')
    }

    // Get repositories
    const { data: repositories, error: reposError } = await supabase
      .from('repositories')
      .select('*')
      .eq('profile_id', profileId)

    if (reposError) {
      throw new Error('Failed to fetch repositories')
    }

    // Get all available badges
    const { data: allBadges, error: badgesError } = await supabase
      .from('badges')
      .select('*')
      .eq('is_active', true)

    if (badgesError) {
      throw new Error('Failed to fetch badges')
    }

    // Calculate which badges the user should have
    const earnedBadges = []
    
    for (const badge of allBadges) {
      const criteriaValue = calculateBadgeCriteria(badge, profile, activityData, repositories)
      
      if (criteriaValue !== null && criteriaValue >= (badge.criteria_threshold || 0)) {
        earnedBadges.push({
          badge_id: badge.id,
          criteria_value: criteriaValue
        })
      }
    }

    // Check which badges are already awarded
    const { data: existingBadges, error: existingError } = await supabase
      .from('user_badges')
      .select('badge_id')
      .eq('profile_id', profileId)

    if (existingError) {
      throw new Error('Failed to fetch existing badges')
    }

    const existingBadgeIds = new Set(existingBadges.map(ub => ub.badge_id))
    const newBadges = earnedBadges.filter(eb => !existingBadgeIds.has(eb.badge_id))

    // Award new badges
    if (newBadges.length > 0) {
      const badgesToInsert = newBadges.map(badge => ({
        profile_id: profileId,
        badge_id: badge.badge_id,
        criteria_value: badge.criteria_value
      }))

      const { error: insertError } = await supabase
        .from('user_badges')
        .insert(badgesToInsert)

      if (insertError) {
        throw new Error('Failed to award new badges')
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        newBadges: newBadges.length,
        totalBadges: earnedBadges.length
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error in calculate-badges function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

function calculateBadgeCriteria(badge: any, profile: any, activityData: any[], repositories: any[]): number | null {
  const now = new Date()
  const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
  const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
  const thisYearStart = new Date(now.getFullYear(), 0, 1)

  switch (badge.criteria_type) {
    case 'night_commits':
      // Count contributions between 11 PM and 6 AM in the last month
      return activityData
        .filter(activity => {
          const date = new Date(activity.date)
          return date >= oneMonthAgo && activity.total_contributions > 0
        })
        .reduce((count, activity) => {
          // This is simplified - in reality you'd need actual commit timestamps
          // For now, we'll estimate based on total contributions
          return count + Math.floor(activity.total_contributions * 0.2) // Assume 20% are night commits
        }, 0)

    case 'weekend_commits':
      // Count weekend contributions in the last month
      return activityData
        .filter(activity => {
          const date = new Date(activity.date)
          const dayOfWeek = date.getDay()
          return date >= oneMonthAgo && (dayOfWeek === 0 || dayOfWeek === 6) // Sunday or Saturday
        })
        .reduce((sum, activity) => sum + activity.total_contributions, 0)

    case 'morning_commits':
      // Count contributions between 5 AM and 9 AM in the last month
      return activityData
        .filter(activity => {
          const date = new Date(activity.date)
          return date >= oneMonthAgo && activity.total_contributions > 0
        })
        .reduce((count, activity) => {
          // Simplified - assume 15% are morning commits
          return count + Math.floor(activity.total_contributions * 0.15)
        }, 0)

    case 'repositories':
      return repositories.filter(repo => !repo.is_fork).length

    case 'contribution_streak':
      // Calculate longest consecutive contribution streak
      let maxStreak = 0
      let currentStreak = 0
      const sortedActivity = activityData.sort((a, b) => a.date.localeCompare(b.date))
      
      for (let i = 0; i < sortedActivity.length; i++) {
        if (sortedActivity[i].total_contributions > 0) {
          currentStreak++
          maxStreak = Math.max(maxStreak, currentStreak)
        } else {
          currentStreak = 0
        }
      }
      return maxStreak

    case 'followers':
      // This would come from the original GitHub/GitLab API data
      // For now, return a mock value
      return Math.floor(Math.random() * 200)

    case 'total_stars':
      return repositories.reduce((sum, repo) => sum + repo.stars_count, 0)

    case 'account_age_years':
      const createdAt = new Date(profile.created_at)
      return Math.floor((now.getTime() - createdAt.getTime()) / (365 * 24 * 60 * 60 * 1000))

    case 'languages':
      const uniqueLanguages = new Set(
        repositories
          .filter(repo => repo.language)
          .map(repo => repo.language)
      )
      return uniqueLanguages.size

    case 'contribution_days':
      // Count days with contributions this year
      return activityData
        .filter(activity => {
          const date = new Date(activity.date)
          return date >= thisYearStart && activity.total_contributions > 0
        })
        .length

    case 'contributions':
      const timeframe = badge.criteria_timeframe
      let startDate: Date
      
      if (timeframe === 'last_month') {
        startDate = oneMonthAgo
      } else if (timeframe === 'last_year') {
        startDate = oneYearAgo
      } else if (timeframe === 'this_year') {
        startDate = thisYearStart
      } else {
        startDate = new Date(0) // All time
      }
      
      return activityData
        .filter(activity => new Date(activity.date) >= startDate)
        .reduce((sum, activity) => sum + activity.total_contributions, 0)

    case 'contributed_repos':
      // Count unique repositories contributed to
      return activityData
        .filter(activity => activity.repositories_contributed > 0)
        .reduce((sum, activity) => sum + activity.repositories_contributed, 0)

    case 'owned_repo_stars':
      return repositories
        .filter(repo => !repo.is_fork)
        .reduce((sum, repo) => sum + repo.stars_count, 0)

    case 'repo_languages':
      const repoLanguages = new Set(
        repositories
          .filter(repo => !repo.is_fork && repo.language)
          .map(repo => repo.language)
      )
      return repoLanguages.size

    default:
      return null
  }
}