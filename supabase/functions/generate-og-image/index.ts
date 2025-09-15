import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const username = url.searchParams.get('username')
    const displayName = url.searchParams.get('displayName')
    const bio = url.searchParams.get('bio')
    const avatar = url.searchParams.get('avatar')
    const stats = url.searchParams.get('stats') // JSON string of stats
    const badges = url.searchParams.get('badges') // Number of badges

    if (!username || !displayName) {
      return new Response('Missing required parameters', { status: 400 })
    }

    // Generate SVG for the Open Graph image
    const svgContent = generateProfileSVG({
      username,
      displayName,
      bio: bio || 'Developer Profile',
      avatar: avatar || '',
      stats: stats ? JSON.parse(stats) : {},
      badgeCount: parseInt(badges || '0')
    })

    // Convert SVG to PNG (in a real implementation, you'd use a library like Puppeteer or similar)
    // For now, we'll return the SVG as is, which many social platforms support
    return new Response(svgContent, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
      }
    })

  } catch (error) {
    console.error('Error generating OG image:', error)
    return new Response('Error generating image', { 
      status: 500,
      headers: corsHeaders
    })
  }
})

function generateProfileSVG(data: {
  username: string
  displayName: string
  bio: string
  avatar: string
  stats: any
  badgeCount: number
}) {
  const { username, displayName, bio, avatar, stats, badgeCount } = data

  return `
    <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#000000;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#001a0d;stop-opacity:1" />
        </linearGradient>
        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#00ff00" stroke-width="0.5" opacity="0.1"/>
        </pattern>
      </defs>
      
      <!-- Background -->
      <rect width="1200" height="630" fill="url(#bg)"/>
      <rect width="1200" height="630" fill="url(#grid)"/>
      
      <!-- Main content container -->
      <g transform="translate(60, 60)">
        <!-- DevHood branding -->
        <text x="0" y="40" font-family="monospace" font-size="24" font-weight="bold" fill="#00ff00">
          DevHood
        </text>
        
        <!-- Profile section -->
        <g transform="translate(0, 80)">
          <!-- Avatar circle (placeholder) -->
          <circle cx="80" cy="80" r="60" fill="#1a1a1a" stroke="#00ff00" stroke-width="2"/>
          <text x="80" y="90" font-family="monospace" font-size="24" font-weight="bold" fill="#00ff00" text-anchor="middle">
            ${username.slice(0, 2).toUpperCase()}
          </text>
          
          <!-- Profile info -->
          <g transform="translate(180, 20)">
            <!-- Display name -->
            <text x="0" y="30" font-family="system-ui" font-size="36" font-weight="bold" fill="#00ff00">
              ${displayName}
            </text>
            
            <!-- Username -->
            <text x="0" y="65" font-family="monospace" font-size="20" fill="#66ff66">
              @${username}
            </text>
            
            <!-- Bio -->
            <text x="0" y="100" font-family="system-ui" font-size="16" fill="#99ff99">
              ${bio.length > 80 ? bio.substring(0, 77) + '...' : bio}
            </text>
          </g>
        </g>
        
        <!-- Stats section -->
        <g transform="translate(0, 280)">
          <!-- Stats header -->
          <text x="0" y="30" font-family="monospace" font-size="18" font-weight="bold" fill="#00ff00">
            [ DEVELOPER STATS ]
          </text>
          
          <!-- Stats grid -->
          <g transform="translate(0, 60)">
            <!-- Repositories -->
            <g transform="translate(0, 0)">
              <rect x="0" y="0" width="250" height="80" fill="#1a1a1a" stroke="#00ff00" stroke-width="1" rx="8"/>
              <text x="20" y="30" font-family="system-ui" font-size="14" fill="#66ff66">Repositories</text>
              <text x="20" y="60" font-family="monospace" font-size="24" font-weight="bold" fill="#00ff00">
                ${stats.repos || '0'}
              </text>
            </g>
            
            <!-- Stars -->
            <g transform="translate(270, 0)">
              <rect x="0" y="0" width="250" height="80" fill="#1a1a1a" stroke="#00ff00" stroke-width="1" rx="8"/>
              <text x="20" y="30" font-family="system-ui" font-size="14" fill="#66ff66">Stars Earned</text>
              <text x="20" y="60" font-family="monospace" font-size="24" font-weight="bold" fill="#00ff00">
                ${stats.stars || '0'}
              </text>
            </g>
            
            <!-- Contributions -->
            <g transform="translate(540, 0)">
              <rect x="0" y="0" width="250" height="80" fill="#1a1a1a" stroke="#00ff00" stroke-width="1" rx="8"/>
              <text x="20" y="30" font-family="system-ui" font-size="14" fill="#66ff66">Contributions</text>
              <text x="20" y="60" font-family="monospace" font-size="24" font-weight="bold" fill="#00ff00">
                ${stats.contributions || '0'}
              </text>
            </g>
            
            <!-- Badges -->
            <g transform="translate(810, 0)">
              <rect x="0" y="0" width="250" height="80" fill="#1a1a1a" stroke="#00ff00" stroke-width="1" rx="8"/>
              <text x="20" y="30" font-family="system-ui" font-size="14" fill="#66ff66">Achievements</text>
              <text x="20" y="60" font-family="monospace" font-size="24" font-weight="bold" fill="#00ff00">
                ${badgeCount}
              </text>
            </g>
          </g>
        </g>
        
        <!-- Footer -->
        <g transform="translate(0, 480)">
          <text x="0" y="30" font-family="monospace" font-size="14" fill="#66ff66">
            Your dev fingerprint • devhood.dev
          </text>
        </g>
      </g>
    </svg>
  `
}