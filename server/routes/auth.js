import express from 'express'
import axios from 'axios'
import { db_operations } from '../database.js'

const router = express.Router()

// GitHub OAuth flow
router.post('/github/connect', async (req, res) => {
  try {
    const { code, username } = req.body

    console.log('🔧 GitHub connect request:', {
      code: code?.substring(0, 10) + '...',
      username,
      hasClientId: !!process.env.GITHUB_CLIENT_ID,
      hasClientSecret: !!process.env.GITHUB_CLIENT_SECRET,
      clientUrl: process.env.CLIENT_URL
    })

    if (!code) {
      return res.status(400).json({ error: 'Authorization code required' })
    }

    if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
      return res.status(500).json({
        error: 'GitHub OAuth not configured',
        details: 'Missing GITHUB_CLIENT_ID or GITHUB_CLIENT_SECRET'
      })
    }

    // Exchange code for access token
    const tokenRequest = {
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code: code,
      redirect_uri: `${process.env.CLIENT_URL || 'http://localhost:5173'}/auth/github/callback`
    }

    console.log('🔧 Making token exchange request to GitHub:', {
      url: 'https://github.com/login/oauth/access_token',
      client_id: process.env.GITHUB_CLIENT_ID,
      redirect_uri: tokenRequest.redirect_uri,
      code: code?.substring(0, 10) + '...'
    })

    const tokenResponse = await axios.post('https://github.com/login/oauth/access_token', tokenRequest, {
      headers: {
        'Accept': 'application/json'
      }
    })

    console.log('🔧 GitHub token response:', {
      status: tokenResponse.status,
      data: tokenResponse.data,
      hasAccessToken: !!tokenResponse.data?.access_token
    })

    const { access_token, error, error_description } = tokenResponse.data

    if (error) {
      console.error('❌ GitHub token exchange error:', { error, error_description })
      return res.status(400).json({
        error: 'GitHub token exchange failed',
        details: error_description || error
      })
    }

    if (!access_token) {
      console.error('❌ No access token in response:', tokenResponse.data)
      return res.status(400).json({ error: 'Failed to get access token' })
    }

    console.log('✅ Successfully got GitHub access token:', access_token.substring(0, 10) + '...')

    // Get user info
    const userResponse = await axios.get('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    })

    const githubUser = userResponse.data

    // Save to database immediately
    try {
      // Create or update profile (marking it as claimed)
      const profile = await db_operations.createOrUpdateProfile(username, {
        display_name: githubUser.name || githubUser.login,
        bio: githubUser.bio || '',
        location: githubUser.location || '',
        website: githubUser.blog || '',
        avatar_url: githubUser.avatar_url
      })

      // Save OAuth connection
      await db_operations.saveOAuthConnection(profile.id, 'github', {
        id: githubUser.id.toString(),
        username: githubUser.login,
        access_token: access_token,
        user_data: githubUser
      })

      console.log(`✅ GitHub connected and saved to database for ${username}:`, {
        profileId: profile.id,
        githubId: githubUser.id,
        githubLogin: githubUser.login
      })

    } catch (dbError) {
      console.error('❌ Database save error:', dbError)
      // Continue anyway - don't fail the OAuth flow
    }

    // Also keep in memory for backward compatibility
    if (!global.userConnections) {
      global.userConnections = new Map()
    }

    const connectionData = {
      githubId: githubUser.id,
      githubLogin: githubUser.login,
      githubAccessToken: access_token,
      githubData: githubUser,
      connectedAt: new Date().toISOString()
    }

    const existing = global.userConnections.get(username) || {}
    global.userConnections.set(username, { ...existing, ...connectionData })

    res.json({
      success: true,
      github: {
        id: githubUser.id,
        login: githubUser.login,
        avatar_url: githubUser.avatar_url,
        name: githubUser.name,
        email: githubUser.email,
        public_repos: githubUser.public_repos,
        followers: githubUser.followers,
        following: githubUser.following
      }
    })

  } catch (error) {
    console.error('GitHub auth error:', error.response?.data || error.message)
    res.status(500).json({
      error: 'GitHub authentication failed',
      details: error.response?.data?.error_description || error.message
    })
  }
})

// GitLab OAuth flow
router.post('/gitlab/connect', async (req, res) => {
  try {
    const { code, username } = req.body

    console.log('🔧 GitLab connect request:', {
      code: code?.substring(0, 10) + '...',
      username,
      hasClientId: !!process.env.GITLAB_CLIENT_ID,
      hasClientSecret: !!process.env.GITLAB_CLIENT_SECRET,
      clientUrl: process.env.CLIENT_URL
    })

    if (!code) {
      return res.status(400).json({ error: 'Authorization code required' })
    }

    if (!process.env.GITLAB_CLIENT_ID || !process.env.GITLAB_CLIENT_SECRET) {
      return res.status(500).json({
        error: 'GitLab OAuth not configured',
        details: 'Missing GITLAB_CLIENT_ID or GITLAB_CLIENT_SECRET'
      })
    }

    // Exchange code for access token
    const tokenRequest = {
      client_id: process.env.GITLAB_CLIENT_ID,
      client_secret: process.env.GITLAB_CLIENT_SECRET,
      code: code,
      grant_type: 'authorization_code',
      redirect_uri: `${process.env.CLIENT_URL || 'http://localhost:5173'}/auth/gitlab/callback`
    }

    console.log('🔧 Making token exchange request to GitLab:', {
      url: 'https://gitlab.com/oauth/token',
      client_id: process.env.GITLAB_CLIENT_ID,
      redirect_uri: tokenRequest.redirect_uri,
      code: code?.substring(0, 10) + '...'
    })

    const tokenResponse = await axios.post('https://gitlab.com/oauth/token', tokenRequest)

    console.log('🔧 GitLab token response:', {
      status: tokenResponse.status,
      data: tokenResponse.data,
      hasAccessToken: !!tokenResponse.data?.access_token
    })

    const { access_token, refresh_token, expires_in, error, error_description } = tokenResponse.data

    if (error) {
      console.error('❌ GitLab token exchange error:', { error, error_description })
      return res.status(400).json({
        error: 'GitLab token exchange failed',
        details: error_description || error
      })
    }

    if (!access_token) {
      console.error('❌ No access token in GitLab response:', tokenResponse.data)
      return res.status(400).json({ error: 'Failed to get access token' })
    }

    console.log('✅ GitLab token details:', {
      hasAccessToken: !!access_token,
      hasRefreshToken: !!refresh_token,
      expiresIn: expires_in
    })

    console.log('✅ Successfully got GitLab access token:', access_token.substring(0, 10) + '...')

    // Get user info
    const userResponse = await axios.get('https://gitlab.com/api/v4/user', {
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    })

    const gitlabUser = userResponse.data

    // Save to database immediately
    try {
      // Create or update profile (marking it as claimed)
      const profile = await db_operations.createOrUpdateProfile(username, {
        display_name: gitlabUser.name || gitlabUser.username,
        bio: gitlabUser.bio || '',
        location: gitlabUser.location || '',
        website: gitlabUser.web_url || '',
        avatar_url: gitlabUser.avatar_url
      })

      // Save OAuth connection
      await db_operations.saveOAuthConnection(profile.id, 'gitlab', {
        id: gitlabUser.id.toString(),
        username: gitlabUser.username,
        access_token: access_token,
        refresh_token: refresh_token,
        expires_in: expires_in,
        user_data: gitlabUser
      })

      console.log(`✅ GitLab connected and saved to database for ${username}:`, {
        profileId: profile.id,
        gitlabId: gitlabUser.id,
        gitlabUsername: gitlabUser.username
      })

    } catch (dbError) {
      console.error('❌ Database save error:', dbError)
      // Continue anyway - don't fail the OAuth flow
    }

    // Also keep in memory for backward compatibility
    if (!global.userConnections) {
      global.userConnections = new Map()
    }

    const connectionData = {
      gitlabId: gitlabUser.id,
      gitlabUsername: gitlabUser.username,
      gitlabAccessToken: access_token,
      gitlabData: gitlabUser,
      connectedAt: new Date().toISOString()
    }

    // Store or update existing connection
    const existing = global.userConnections.get(username) || {}
    global.userConnections.set(username, { ...existing, ...connectionData })

    res.json({
      success: true,
      gitlab: {
        id: gitlabUser.id,
        username: gitlabUser.username,
        avatar_url: gitlabUser.avatar_url,
        name: gitlabUser.name,
        email: gitlabUser.email,
        public_repos: gitlabUser.public_repos || 0,
        followers: gitlabUser.followers || 0,
        following: gitlabUser.following || 0
      }
    })

  } catch (error) {
    console.error('GitLab auth error:', error.response?.data || error.message)
    res.status(500).json({
      error: 'GitLab authentication failed',
      details: error.response?.data?.error_description || error.message
    })
  }
})

// Get OAuth URLs
router.get('/github/url/:username', (req, res) => {
  const { username } = req.params

  // Check if GitHub OAuth is configured
  if (!process.env.GITHUB_CLIENT_ID) {
    return res.status(500).json({
      error: 'GitHub OAuth not configured',
      details: 'GITHUB_CLIENT_ID environment variable is missing. Please set up a GitHub OAuth app first.'
    })
  }

  const redirectUri = `${process.env.CLIENT_URL || 'http://localhost:5173'}/auth/github/callback`

  const githubUrl = `https://github.com/login/oauth/authorize?` +
    `client_id=${process.env.GITHUB_CLIENT_ID}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `scope=public_repo,read:user&` +
    `state=${username}`

  console.log('Generated GitHub OAuth URL:', githubUrl)
  console.log('Redirect URI:', redirectUri)
  console.log('Client ID:', process.env.GITHUB_CLIENT_ID?.substring(0, 8) + '...')

  res.json({ url: githubUrl })
})

router.get('/gitlab/url/:username', (req, res) => {
  const { username } = req.params

  // Check if GitLab OAuth is configured
  if (!process.env.GITLAB_CLIENT_ID) {
    return res.status(500).json({
      error: 'GitLab OAuth not configured',
      details: 'GITLAB_CLIENT_ID environment variable is missing. Please set up a GitLab OAuth app first.'
    })
  }

  const redirectUri = `${process.env.CLIENT_URL || 'http://localhost:5173'}/auth/gitlab/callback`

  const gitlabUrl = `https://gitlab.com/oauth/authorize?` +
    `client_id=${process.env.GITLAB_CLIENT_ID}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `response_type=code&` +
    `scope=read_user&` +
    `state=${username}`

  console.log('Generated GitLab OAuth URL:', gitlabUrl)
  console.log('Redirect URI:', redirectUri)
  console.log('Client ID:', process.env.GITLAB_CLIENT_ID?.substring(0, 8) + '...')

  res.json({ url: gitlabUrl })
})

// Get stored connection data for a username
router.get('/connections/:username', (req, res) => {
  const { username } = req.params
  const connections = global.userConnections?.get(username)

  if (!connections) {
    return res.json({
      connected: false,
      github: null,
      gitlab: null
    })
  }

  res.json({
    connected: true,
    github: connections.githubData ? {
      id: connections.githubData.id,
      login: connections.githubData.login,
      avatar_url: connections.githubData.avatar_url,
      name: connections.githubData.name,
      email: connections.githubData.email,
      public_repos: connections.githubData.public_repos,
      followers: connections.githubData.followers,
      following: connections.githubData.following
    } : null,
    gitlab: connections.gitlabData ? {
      id: connections.gitlabData.id,
      username: connections.gitlabData.username,
      avatar_url: connections.gitlabData.avatar_url,
      name: connections.gitlabData.name,
      email: connections.gitlabData.email,
      public_repos: connections.gitlabData.public_repos || 0,
      followers: connections.gitlabData.followers || 0,
      following: connections.gitlabData.following || 0
    } : null
  })
})

// Force GitLab re-authentication for existing connections
router.post('/gitlab/reconnect/:username', async (req, res) => {
  try {
    const { username } = req.params

    // Check if profile exists and has GitLab connection
    const profile = await db_operations.getProfileWithConnections(username)
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' })
    }

    const connections = await db_operations.getOAuthConnections(profile.id)
    const gitlabConnection = connections.find(c => c.provider === 'gitlab')

    if (!gitlabConnection) {
      return res.status(404).json({ error: 'No GitLab connection found for this profile' })
    }

    // Generate new GitLab OAuth URL
    const redirectUri = `${process.env.CLIENT_URL || 'http://localhost:5173'}/auth/gitlab/callback`
    const gitlabUrl = `https://gitlab.com/oauth/authorize?` +
      `client_id=${process.env.GITLAB_CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=code&` +
      `scope=read_user&` +
      `state=${username}`

    res.json({
      success: true,
      message: 'GitLab re-authentication required',
      oauth_url: gitlabUrl,
      reason: 'Token expired and no refresh token available'
    })

  } catch (error) {
    console.error('GitLab reconnect error:', error)
    res.status(500).json({ error: 'Failed to generate reconnect URL' })
  }
})

// Check if a profile is claimed
router.get('/profile/:username/status', async (req, res) => {
  try {
    const { username } = req.params
    const profile = await db_operations.getProfileWithConnections(username)

    if (!profile) {
      return res.json({
        claimed: false,
        username,
        connections: []
      })
    }

    res.json({
      claimed: true,
      username,
      profile: {
        id: profile.id,
        display_name: profile.display_name,
        bio: profile.bio,
        location: profile.location,
        website: profile.website,
        avatar_url: profile.avatar_url,
        claimed_at: profile.claimed_at
      },
      connections: profile.connections || []
    })

  } catch (error) {
    console.error('Error checking profile status:', error)
    res.status(500).json({ error: 'Failed to check profile status' })
  }
})

// Debug endpoint to see stored connections
router.get('/debug/connections', (req, res) => {
  if (!global.userConnections) {
    return res.json({ message: 'No connections stored' })
  }

  const connections = {}
  for (const [username, data] of global.userConnections.entries()) {
    connections[username] = {
      hasGitHub: !!data.githubData,
      hasGitLab: !!data.gitlabData,
      githubUser: data.githubData?.login,
      gitlabUser: data.gitlabData?.username,
      connectedAt: data.connectedAt
    }
  }

  res.json({ connections })
})

export default router