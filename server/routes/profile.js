import express from 'express'
import axios from 'axios'
import { db_operations } from '../database.js'

const router = express.Router()

// Helper function to refresh GitLab access token
async function refreshGitLabToken(connection) {
  if (!connection.refresh_token) {
    console.error('❌ No refresh token available for GitLab connection')
    return null
  }

  try {
    console.log('🔄 Refreshing GitLab access token...')

    const refreshRequest = {
      grant_type: 'refresh_token',
      refresh_token: connection.refresh_token,
      client_id: process.env.GITLAB_CLIENT_ID,
      client_secret: process.env.GITLAB_CLIENT_SECRET
    }

    const response = await axios.post('https://gitlab.com/oauth/token', refreshRequest)
    const { access_token, refresh_token, expires_in } = response.data

    if (!access_token) {
      console.error('❌ Failed to refresh GitLab token:', response.data)
      return null
    }

    console.log('✅ GitLab token refreshed successfully')

    // Update token in database
    await db_operations.saveOAuthConnection(connection.profile_id, 'gitlab', {
      id: connection.provider_user_id,
      username: connection.provider_username,
      access_token: access_token,
      refresh_token: refresh_token || connection.refresh_token,
      expires_in: expires_in,
      user_data: JSON.parse(connection.user_data)
    })

    // Return updated connection
    return {
      ...connection,
      access_token: access_token,
      refresh_token: refresh_token || connection.refresh_token
    }
  } catch (error) {
    console.error('❌ GitLab token refresh failed:', error.response?.data || error.message)
    return null
  }
}

// In-memory storage for demo (use database in production)
const profiles = new Map()

// Claim a profile
router.post('/claim/:username', async (req, res) => {
  try {
    const { username } = req.params
    const { settings, githubData, gitlabData } = req.body

    // Validate required data
    if (!githubData && !gitlabData) {
      return res.status(400).json({
        error: 'At least one platform connection (GitHub or GitLab) is required'
      })
    }

    // Create or update profile
    const profile = {
      username,
      settings,
      githubData,
      gitlabData,
      claimed: true,
      claimedAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    }

    profiles.set(username, profile)

    res.json({
      success: true,
      message: 'Profile claimed successfully',
      profile
    })

  } catch (error) {
    console.error('Profile claim error:', error)
    res.status(500).json({
      error: 'Failed to claim profile',
      details: error.message
    })
  }
})

// Get profile status
router.get('/status/:username', (req, res) => {
  const { username } = req.params
  const profile = profiles.get(username)
  const connections = global.userConnections?.get(username)

  res.json({
    username,
    claimed: !!profile?.claimed,
    claimedAt: profile?.claimedAt || null,
    hasGitHub: !!profile?.githubData || !!connections?.githubData,
    hasGitLab: !!profile?.gitlabData || !!connections?.gitlabData,
    connections: connections ? {
      github: !!connections.githubData,
      gitlab: !!connections.gitlabData,
      githubUser: connections.githubData?.login,
      gitlabUser: connections.gitlabData?.username
    } : null
  })
})

// Update profile settings
router.put('/settings/:username', (req, res) => {
  try {
    const { username } = req.params
    const { settings } = req.body

    const profile = profiles.get(username)
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' })
    }

    // Update settings
    profile.settings = { ...profile.settings, ...settings }
    profile.lastUpdated = new Date().toISOString()

    profiles.set(username, profile)

    res.json({
      success: true,
      message: 'Settings updated successfully',
      settings: profile.settings
    })

  } catch (error) {
    console.error('Settings update error:', error)
    res.status(500).json({
      error: 'Failed to update settings',
      details: error.message
    })
  }
})

// Get combined contribution data
router.get('/contributions/:username', async (req, res) => {
  try {
    const { username } = req.params

    // Get profile from database to check if claimed
    const profileStatus = await db_operations.getProfileWithConnections(username)

    if (!profileStatus) {
      return res.status(404).json({ error: 'Profile not found or not claimed' })
    }

    // Get OAuth connections to fetch access tokens
    const connections = await db_operations.getOAuthConnections(profileStatus.id)

    const contributions = {
      github: null,
      gitlab: null,
      combined: null
    }

    const promises = []

    console.log(`🔧 Found ${connections.length} OAuth connections for profile ${profileStatus.id}`)
    connections.forEach(conn => {
      console.log(`🔧 Connection: ${conn.provider} - ${conn.provider_username}`)
    })

    // Fetch GitHub contributions if connected
    const githubConnection = connections.find(c => c.provider === 'github')
    if (githubConnection) {
      console.log('🔧 Found GitHub connection, fetching contributions...')
      promises.push(
        fetchGitHubContributions(githubConnection)
          .then(data => {
            console.log('✅ GitHub contributions fetched:', data ? `${data.total} total` : 'null')
            contributions.github = data
          })
          .catch(err => {
            console.error('❌ GitHub contributions fetch failed:', err)
            contributions.github = null
          })
      )
    } else {
      console.log('❌ No GitHub connection found')
    }

    // Fetch GitLab contributions if connected
    const gitlabConnection = connections.find(c => c.provider === 'gitlab')
    if (gitlabConnection) {
      console.log('🔧 Found GitLab connection, fetching contributions...')
      promises.push(
        fetchGitLabContributions(gitlabConnection)
          .then(data => {
            console.log('✅ GitLab contributions fetched:', data ? `${data.total} total` : 'null')
            contributions.gitlab = data
          })
          .catch(err => {
            console.error('❌ GitLab contributions fetch failed:', err)
            contributions.gitlab = null
          })
      )
    } else {
      console.log('❌ No GitLab connection found')
    }

    // Wait for all API calls to complete
    await Promise.all(promises)

    // Combine contributions if both platforms have data
    console.log('🔧 Final contributions before combining:')
    console.log('🔧 GitHub:', contributions.github ? `${contributions.github.total} contributions` : 'null')
    console.log('🔧 GitLab:', contributions.gitlab ? `${contributions.gitlab.total} contributions` : 'null')

    if (contributions.github && contributions.gitlab) {
      console.log('✅ Combining GitHub and GitLab contributions...')
      contributions.combined = combineContributions(contributions.github, contributions.gitlab)
      console.log('✅ Combined result:', contributions.combined ? `${contributions.combined.total} total contributions` : 'null')
    } else {
      console.log('❌ Cannot combine - missing data from one or both platforms')
    }

    res.json({
      success: true,
      contributions,
      lastUpdated: new Date().toISOString()
    })

  } catch (error) {
    console.error('Contributions fetch error:', error)
    res.status(500).json({
      error: 'Failed to fetch contributions',
      details: error.message
    })
  }
})

// Fetch GitHub contributions using GraphQL API
async function fetchGitHubContributions(connection) {
  const userData = JSON.parse(connection.user_data)
  const query = `
    query($username: String!) {
      user(login: $username) {
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                date
                contributionCount
              }
            }
          }
        }
      }
    }
  `

  try {
    const response = await axios.post('https://api.github.com/graphql', {
      query,
      variables: { username: userData.login }
    }, {
      headers: {
        'Authorization': `Bearer ${connection.access_token}`,
        'Content-Type': 'application/json'
      }
    })

    if (response.data.errors) {
      console.error('GitHub GraphQL errors:', response.data.errors)
      return null
    }

    const calendar = response.data.data.user.contributionsCollection.contributionCalendar
    const contributions = []

    calendar.weeks.forEach(week => {
      week.contributionDays.forEach(day => {
        contributions.push({
          date: day.date,
          count: day.contributionCount,
          platform: 'github'
        })
      })
    })

    return {
      total: calendar.totalContributions,
      data: contributions
    }
  } catch (error) {
    console.error('GitHub contributions API error:', error.response?.data || error.message)
    return null
  }
}

// Helper function to fetch all GitLab events with pagination and date filtering
async function fetchAllGitLabEvents(accessToken, userId, oneYearAgo) {
  const allEvents = []
  let page = 1
  const perPage = 100
  let hasMore = true

  // Calculate exact date range for the contribution graph (365 days ending today)
  const today = new Date()
  const startDate = new Date(today)
  startDate.setFullYear(today.getFullYear() - 1)
  startDate.setDate(today.getDate() + 1) // Start from tomorrow last year

  const afterDate = startDate.toISOString().split('T')[0]
  const beforeDate = today.toISOString().split('T')[0]

  console.log(`🔄 Starting GitLab events pagination with date filter: ${afterDate} to ${beforeDate}`)

  while (hasMore) {
    try {
      console.log(`📄 Fetching GitLab events page ${page}...`)

      const response = await axios.get(`https://gitlab.com/api/v4/users/${userId}/events`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        params: {
          per_page: perPage,
          page: page,
          after: afterDate,
          before: beforeDate
        }
      })

      const events = response.data
      console.log(`📄 Page ${page}: ${events.length} events (filtered by API)`)

      if (events.length === 0) {
        hasMore = false
        break
      }

      // All events are already filtered by the API, so add them all
      allEvents.push(...events)

      // If we got fewer events than requested, we've reached the end
      if (events.length < perPage) {
        hasMore = false
      }

      page++

      // Safety limit to avoid infinite loops
      if (page > 50) {
        console.log('⚠️ Reached pagination safety limit (50 pages)')
        hasMore = false
      }

    } catch (error) {
      console.error(`❌ Error fetching GitLab events page ${page}:`, error.response?.data || error.message)
      hasMore = false
    }
  }

  console.log(`✅ GitLab pagination complete: ${allEvents.length} events from ${page - 1} pages (${afterDate} to ${beforeDate})`)
  return allEvents
}

// Fetch GitLab contributions using REST API
async function fetchGitLabContributions(originalConnection) {
  let connection = originalConnection
  const userData = JSON.parse(connection.user_data)

  console.log(`🔧 Fetching GitLab contributions for user ${userData.username} (ID: ${userData.id})`)
  console.log(`🔧 Using access token: ${connection.access_token.substring(0, 10)}...`)
  console.log(`🔧 Has refresh token: ${!!connection.refresh_token}`)
  console.log(`🔧 Token expires at: ${connection.expires_at || 'unknown'}`)

  // Check if token is expired and refresh if needed
  if (connection.expires_at) {
    const expirationTime = new Date(connection.expires_at)
    const now = new Date()
    const bufferTime = 5 * 60 * 1000 // 5 minutes buffer

    if (now >= (expirationTime.getTime() - bufferTime)) {
      console.log('⏰ GitLab token is expired or about to expire, refreshing...')
      const refreshedConnection = await refreshGitLabToken(connection)
      if (refreshedConnection) {
        connection = refreshedConnection
        console.log('✅ Using refreshed GitLab token')
      } else {
        console.error('❌ Failed to refresh GitLab token')
        return null
      }
    }
  }

  try {
    // Calculate exact date range (365 days ending today)
    const today = new Date()
    const startDate = new Date(today)
    startDate.setFullYear(today.getFullYear() - 1)
    startDate.setDate(today.getDate() + 1) // Start from tomorrow last year

    console.log(`🔧 Fetching events for exact 365-day range: ${startDate.toISOString().split('T')[0]} to ${today.toISOString().split('T')[0]}`)

    // Fetch all events with pagination and date filtering
    const allEvents = await fetchAllGitLabEvents(connection.access_token, userData.id, startDate)

    // Process the response using the helper function
    return processGitLabEvents(allEvents, userData.username, startDate)
  } catch (error) {
    console.error('❌ GitLab contributions API error:', error.response?.data || error.message)

    // If token is invalid, try to refresh it once
    if (error.response?.data?.error === 'invalid_token') {
      if (connection.refresh_token) {
        console.log('🔄 Token invalid, attempting to refresh...')
        const refreshedConnection = await refreshGitLabToken(connection)

        if (refreshedConnection) {
          console.log('✅ Token refreshed, retrying API call with pagination...')
          try {
            const oneYearAgo = new Date()
            oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)

            // Fetch all events with pagination using refreshed token
            const allEvents = await fetchAllGitLabEvents(refreshedConnection.access_token, userData.id, oneYearAgo)

            // Process the retry response (reuse the existing logic)
            return processGitLabEvents(allEvents, userData.username, oneYearAgo)
          } catch (retryError) {
            console.error('❌ GitLab contributions API retry failed:', retryError.response?.data || retryError.message)
            return null
          }
        }
      } else {
        console.log('❌ GitLab token is expired and no refresh token available')
        console.log('💡 User needs to re-authenticate GitLab connection')
        return {
          error: 'gitlab_reauth_required',
          message: 'GitLab connection expired. Please reconnect your GitLab account.',
          total: 0,
          data: []
        }
      }
    }

    console.error('❌ GitLab API URL:', `https://gitlab.com/api/v4/users/${userData.id}/events`)
    return null
  }

  // Extract processing logic to reuse for retry
  function processGitLabEvents(events, username, oneYearAgo) {
    console.log(`📊 GitLab API returned ${events.length} events for user ${username}`)

    // Log first few events for debugging
    if (events.length > 0) {
      console.log('📊 Sample GitLab events:', events.slice(0, 3).map(e => ({
        action: e.action_name,
        date: e.created_at.split('T')[0],
        target_type: e.target_type
      })))
    }

    // Count contributions by date from events (only days with actual contributions)
    const contributionMap = new Map()
    let totalContributions = 0

    console.log(`📊 Processing ${events.length} pre-filtered GitLab events`)
    events.forEach(event => {
      const eventDate = event.created_at.split('T')[0]

      // All events are already filtered by API, so count them all
      contributionMap.set(eventDate, (contributionMap.get(eventDate) || 0) + 1)
      totalContributions++
    })

    // Only return days that actually have contributions (no zero days)
    const contributions = Array.from(contributionMap.entries()).map(([date, count]) => ({
      date,
      count,
      platform: 'gitlab'
    })).filter(day => day.count > 0) // Only include days with actual contributions

    console.log('BANANA')
    console.log(contributions)

    console.log(`📊 GitLab processed contributions: ${totalContributions} total across ${contributions.length} active days`)
    console.log(`📊 GitLab contribution dates:`, contributions.slice(0, 5).map(c => `${c.date}: ${c.count}`))

    return {
      total: totalContributions,
      data: contributions
    }
  }
}

// Helper function to combine GitHub and GitLab contributions
function combineContributions(github, gitlab) {
  const combined = new Map()

  // Add GitHub contributions (only days with contributions > 0)
  github.data.forEach(day => {
    if (day.count > 0) {
      combined.set(day.date, {
        date: day.date,
        github: day.count,
        gitlab: 0,
        total: day.count
      })
    }
  })

  // Add GitLab contributions (merge with existing or create new)
  gitlab.data.forEach(day => {
    if (day.count > 0) {
      const existing = combined.get(day.date)
      if (existing) {
        existing.gitlab = day.count
        existing.total += day.count
      } else {
        combined.set(day.date, {
          date: day.date,
          github: 0,
          gitlab: day.count,
          total: day.count
        })
      }
    }
  })

  // Convert to array and sort by date (only days with actual contributions)
  const data = Array.from(combined.values())
    .filter(day => day.total > 0) // Only include days with actual contributions
    .sort((a, b) => a.date.localeCompare(b.date))

  console.log(`📊 Combined contributions: ${data.length} active days out of ${github.data.length + gitlab.data.length} total API days`)

  return {
    total: github.total + gitlab.total,
    githubTotal: github.total,
    gitlabTotal: gitlab.total,
    data: data.map(day => ({
      ...day,
      // Add intensity level for heatmap (0-4 scale)
      intensity: Math.min(4, Math.floor(day.total / 3))
    }))
  }
}

export default router