import express from 'express'
import { createCanvas, loadImage } from 'canvas'
import path from 'path'
import fs from 'fs/promises'

const router = express.Router()

// Generate profile card
router.get('/card/:username/:format', async (req, res) => {
  try {
    const { username, format } = req.params
    const { theme = 'dark', style = 'default' } = req.query

    if (!['png', 'svg'].includes(format)) {
      return res.status(400).json({ error: 'Invalid format. Use png or svg' })
    }

    if (format === 'png') {
      const canvas = createCanvas(800, 400)
      const ctx = canvas.getContext('2d')

      // Background
      const bgColor = theme === 'dark' ? '#0f0f0f' : '#ffffff'
      const textColor = theme === 'dark' ? '#22c55e' : '#16a34a'

      ctx.fillStyle = bgColor
      ctx.fillRect(0, 0, 800, 400)

      // Border
      ctx.strokeStyle = textColor
      ctx.lineWidth = 2
      ctx.strokeRect(10, 10, 780, 380)

      // Grid pattern
      ctx.strokeStyle = theme === 'dark' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(22, 163, 74, 0.1)'
      ctx.lineWidth = 1
      for (let i = 0; i < 800; i += 20) {
        ctx.beginPath()
        ctx.moveTo(i, 0)
        ctx.lineTo(i, 400)
        ctx.stroke()
      }
      for (let i = 0; i < 400; i += 20) {
        ctx.beginPath()
        ctx.moveTo(0, i)
        ctx.lineTo(800, i)
        ctx.stroke()
      }

      // Title
      ctx.fillStyle = textColor
      ctx.font = 'bold 48px monospace'
      ctx.textAlign = 'center'
      ctx.fillText(`@${username}`, 400, 100)

      // Subtitle
      ctx.font = '24px monospace'
      ctx.fillText('DevHood Profile', 400, 140)

      // Stats section
      ctx.font = '20px monospace'
      ctx.textAlign = 'left'

      const stats = [
        '🚀 42 Repositories',
        '💻 1,337 Commits This Year',
        '⭐ 15 Day Streak',
        '🌟 Open Source Contributor'
      ]

      stats.forEach((stat, index) => {
        ctx.fillText(stat, 50, 220 + (index * 30))
      })

      // Contribution graph (mini)
      const graphStartX = 50
      const graphStartY = 320
      const cellSize = 8
      const cellGap = 2

      for (let week = 0; week < 20; week++) {
        for (let day = 0; day < 7; day++) {
          const intensity = Math.random()
          const alpha = 0.2 + (intensity * 0.8)

          ctx.fillStyle = `rgba(34, 197, 94, ${alpha})`
          ctx.fillRect(
            graphStartX + week * (cellSize + cellGap),
            graphStartY + day * (cellSize + cellGap),
            cellSize,
            cellSize
          )
        }
      }

      // DevHood branding
      ctx.fillStyle = theme === 'dark' ? 'rgba(34, 197, 94, 0.6)' : 'rgba(22, 163, 74, 0.6)'
      ctx.font = '16px monospace'
      ctx.textAlign = 'right'
      ctx.fillText('devhood.app', 750, 370)

      res.setHeader('Content-Type', 'image/png')
      res.setHeader('Cache-Control', 'public, max-age=3600')
      res.send(canvas.toBuffer('image/png'))

    } else if (format === 'svg') {
      const svg = generateProfileCardSVG(username, theme)
      res.setHeader('Content-Type', 'image/svg+xml')
      res.setHeader('Cache-Control', 'public, max-age=3600')
      res.send(svg)
    }

  } catch (error) {
    console.error('Card generation error:', error)
    res.status(500).json({
      error: 'Failed to generate profile card',
      details: error.message
    })
  }
})

// Generate contribution graph
router.get('/graph/:username/:format', async (req, res) => {
  try {
    const { username, format } = req.params
    const { theme = 'dark', combined = 'false' } = req.query

    if (!['png', 'svg'].includes(format)) {
      return res.status(400).json({ error: 'Invalid format. Use png or svg' })
    }

    if (format === 'png') {
      const canvas = createCanvas(1200, 300)
      const ctx = canvas.getContext('2d')

      // Background
      const bgColor = theme === 'dark' ? '#0f0f0f' : '#ffffff'
      ctx.fillStyle = bgColor
      ctx.fillRect(0, 0, 1200, 300)

      // Generate contribution heatmap
      const cellSize = 12
      const cellGap = 2
      const startX = 100
      const startY = 50

      // Days of week labels
      ctx.fillStyle = theme === 'dark' ? '#22c55e' : '#16a34a'
      ctx.font = '12px monospace'
      ctx.textAlign = 'right'

      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      days.forEach((day, index) => {
        if (index % 2 === 1) { // Show every other day to avoid crowding
          ctx.fillText(day, startX - 10, startY + index * (cellSize + cellGap) + cellSize)
        }
      })

      // Month labels
      ctx.textAlign = 'center'
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      for (let i = 0; i < 12; i++) {
        const x = startX + (i * 4.33 * (cellSize + cellGap)) // Approximate weeks per month
        ctx.fillText(months[i], x, startY - 15)
      }

      // Draw contribution squares
      for (let week = 0; week < 52; week++) {
        for (let day = 0; day < 7; day++) {
          const intensity = Math.random()
          let color

          if (combined === 'true') {
            // Mixed GitHub (green) and GitLab (orange) contributions
            const isGitHub = Math.random() > 0.5
            const baseColor = isGitHub ? [34, 197, 94] : [249, 115, 22]
            const alpha = 0.2 + (intensity * 0.8)
            color = `rgba(${baseColor[0]}, ${baseColor[1]}, ${baseColor[2]}, ${alpha})`
          } else {
            // Standard GitHub green
            const alpha = intensity < 0.1 ? 0.1 : 0.2 + (intensity * 0.8)
            color = `rgba(34, 197, 94, ${alpha})`
          }

          ctx.fillStyle = color
          ctx.fillRect(
            startX + week * (cellSize + cellGap),
            startY + day * (cellSize + cellGap),
            cellSize,
            cellSize
          )
        }
      }

      // Legend
      ctx.fillStyle = theme === 'dark' ? '#22c55e' : '#16a34a'
      ctx.font = '12px monospace'
      ctx.textAlign = 'left'
      ctx.fillText('Less', startX + 52 * (cellSize + cellGap) + 20, startY + 50)

      // Legend squares
      for (let i = 0; i < 5; i++) {
        const alpha = 0.2 + (i * 0.2)
        ctx.fillStyle = `rgba(34, 197, 94, ${alpha})`
        ctx.fillRect(
          startX + 52 * (cellSize + cellGap) + 60 + i * (cellSize + cellGap),
          startY + 35,
          cellSize,
          cellSize
        )
      }

      ctx.fillStyle = theme === 'dark' ? '#22c55e' : '#16a34a'
      ctx.textAlign = 'right'
      ctx.fillText('More', startX + 52 * (cellSize + cellGap) + 60 + 5 * (cellSize + cellGap) + 30, startY + 50)

      // Title and stats
      ctx.font = 'bold 24px monospace'
      ctx.textAlign = 'left'
      ctx.fillText(`${username}'s Contributions`, startX, 30)

      res.setHeader('Content-Type', 'image/png')
      res.setHeader('Cache-Control', 'public, max-age=3600')
      res.send(canvas.toBuffer('image/png'))

    } else if (format === 'svg') {
      const svg = generateContributionGraphSVG(username, theme, combined === 'true')
      res.setHeader('Content-Type', 'image/svg+xml')
      res.setHeader('Cache-Control', 'public, max-age=3600')
      res.send(svg)
    }

  } catch (error) {
    console.error('Graph generation error:', error)
    res.status(500).json({
      error: 'Failed to generate contribution graph',
      details: error.message
    })
  }
})

// Generate stats widget
router.get('/stats/:username/:format', async (req, res) => {
  try {
    const { username, format } = req.params
    const { theme = 'dark' } = req.query

    if (!['png', 'svg'].includes(format)) {
      return res.status(400).json({ error: 'Invalid format. Use png or svg' })
    }

    const svg = generateStatsWidgetSVG(username, theme)

    if (format === 'png') {
      // For PNG, you'd need to convert SVG to PNG (requires additional setup)
      // For now, return SVG with PNG content type
      res.setHeader('Content-Type', 'image/svg+xml')
    } else {
      res.setHeader('Content-Type', 'image/svg+xml')
    }

    res.setHeader('Cache-Control', 'public, max-age=3600')
    res.send(svg)

  } catch (error) {
    console.error('Stats generation error:', error)
    res.status(500).json({
      error: 'Failed to generate stats widget',
      details: error.message
    })
  }
})

// Helper function to generate SVG profile card
function generateProfileCardSVG(username, theme = 'dark') {
  const bgColor = theme === 'dark' ? '#0f0f0f' : '#ffffff'
  const textColor = theme === 'dark' ? '#22c55e' : '#16a34a'
  const gridColor = theme === 'dark' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(22, 163, 74, 0.1)'

  return `
    <svg width="800" height="400" xmlns="http://www.w3.org/2000/svg">
      <rect width="800" height="400" fill="${bgColor}"/>

      <!-- Grid pattern -->
      <defs>
        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="${gridColor}" stroke-width="1"/>
        </pattern>
      </defs>
      <rect width="800" height="400" fill="url(#grid)"/>

      <!-- Border -->
      <rect x="10" y="10" width="780" height="380" fill="none" stroke="${textColor}" stroke-width="2"/>

      <!-- Title -->
      <text x="400" y="100" text-anchor="middle" fill="${textColor}" font-family="monospace" font-size="48" font-weight="bold">@${username}</text>
      <text x="400" y="140" text-anchor="middle" fill="${textColor}" font-family="monospace" font-size="24">DevHood Profile</text>

      <!-- Stats -->
      <text x="50" y="220" fill="${textColor}" font-family="monospace" font-size="20">🚀 42 Repositories</text>
      <text x="50" y="250" fill="${textColor}" font-family="monospace" font-size="20">💻 1,337 Commits This Year</text>
      <text x="50" y="280" fill="${textColor}" font-family="monospace" font-size="20">⭐ 15 Day Streak</text>
      <text x="50" y="310" fill="${textColor}" font-family="monospace" font-size="20">🌟 Open Source Contributor</text>

      <!-- Contribution squares (mini) -->
      ${Array.from({ length: 20 }, (_, week) =>
        Array.from({ length: 7 }, (_, day) => {
          const intensity = Math.random()
          const alpha = 0.2 + (intensity * 0.8)
          return `<rect x="${50 + week * 10}" y="${320 + day * 10}" width="8" height="8" fill="rgba(34, 197, 94, ${alpha})"/>`
        }).join('')
      ).join('')}

      <!-- Branding -->
      <text x="750" y="370" text-anchor="end" fill="rgba(34, 197, 94, 0.6)" font-family="monospace" font-size="16">devhood.app</text>
    </svg>
  `.trim()
}

// Helper function to generate SVG contribution graph
function generateContributionGraphSVG(username, theme = 'dark', combined = false) {
  const bgColor = theme === 'dark' ? '#0f0f0f' : '#ffffff'
  const textColor = theme === 'dark' ? '#22c55e' : '#16a34a'

  const squares = []
  for (let week = 0; week < 52; week++) {
    for (let day = 0; day < 7; day++) {
      const intensity = Math.random()
      let color

      if (combined) {
        const isGitHub = Math.random() > 0.5
        const baseColor = isGitHub ? '34, 197, 94' : '249, 115, 22'
        const alpha = 0.2 + (intensity * 0.8)
        color = `rgba(${baseColor}, ${alpha})`
      } else {
        const alpha = intensity < 0.1 ? 0.1 : 0.2 + (intensity * 0.8)
        color = `rgba(34, 197, 94, ${alpha})`
      }

      squares.push(`<rect x="${100 + week * 14}" y="${50 + day * 14}" width="12" height="12" fill="${color}"/>`)
    }
  }

  return `
    <svg width="1200" height="300" xmlns="http://www.w3.org/2000/svg">
      <rect width="1200" height="300" fill="${bgColor}"/>

      <!-- Title -->
      <text x="100" y="30" fill="${textColor}" font-family="monospace" font-size="24" font-weight="bold">${username}'s Contributions</text>

      <!-- Contribution squares -->
      ${squares.join('')}

      <!-- Legend -->
      <text x="${100 + 52 * 14 + 20}" y="100" fill="${textColor}" font-family="monospace" font-size="12">Less</text>
      ${Array.from({ length: 5 }, (_, i) => {
        const alpha = 0.2 + (i * 0.2)
        return `<rect x="${100 + 52 * 14 + 60 + i * 14}" y="${85}" width="12" height="12" fill="rgba(34, 197, 94, ${alpha})"/>`
      }).join('')}
      <text x="${100 + 52 * 14 + 60 + 5 * 14 + 30}" y="100" fill="${textColor}" font-family="monospace" font-size="12">More</text>
    </svg>
  `.trim()
}

// Helper function to generate SVG stats widget
function generateStatsWidgetSVG(username, theme = 'dark') {
  const bgColor = theme === 'dark' ? '#0f0f0f' : '#ffffff'
  const textColor = theme === 'dark' ? '#22c55e' : '#16a34a'

  return `
    <svg width="400" height="200" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="200" fill="${bgColor}"/>
      <rect x="5" y="5" width="390" height="190" fill="none" stroke="${textColor}" stroke-width="2"/>

      <!-- Title -->
      <text x="200" y="30" text-anchor="middle" fill="${textColor}" font-family="monospace" font-size="18" font-weight="bold">${username}'s Stats</text>

      <!-- Stats grid -->
      <text x="50" y="70" fill="${textColor}" font-family="monospace" font-size="16" font-weight="bold">42</text>
      <text x="50" y="90" fill="${textColor}" font-family="monospace" font-size="12">Repositories</text>

      <text x="150" y="70" fill="${textColor}" font-family="monospace" font-size="16" font-weight="bold">1.3K</text>
      <text x="150" y="90" fill="${textColor}" font-family="monospace" font-size="12">Commits</text>

      <text x="250" y="70" fill="${textColor}" font-family="monospace" font-size="16" font-weight="bold">15</text>
      <text x="250" y="90" fill="${textColor}" font-family="monospace" font-size="12">Day Streak</text>

      <text x="50" y="130" fill="${textColor}" font-family="monospace" font-size="16" font-weight="bold">256</text>
      <text x="50" y="150" fill="${textColor}" font-family="monospace" font-size="12">Stars Earned</text>

      <text x="150" y="130" fill="${textColor}" font-family="monospace" font-size="16" font-weight="bold">89%</text>
      <text x="150" y="150" fill="${textColor}" font-family="monospace" font-size="12">JavaScript</text>

      <text x="250" y="130" fill="${textColor}" font-family="monospace" font-size="16" font-weight="bold">Active</text>
      <text x="250" y="150" fill="${textColor}" font-family="monospace" font-size="12">Status</text>

      <!-- Footer -->
      <text x="350" y="180" text-anchor="end" fill="rgba(34, 197, 94, 0.6)" font-family="monospace" font-size="10">devhood.app</text>
    </svg>
  `.trim()
}

export default router