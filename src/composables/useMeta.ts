import { ref, watch } from 'vue'

interface MetaData {
  title?: string
  description?: string
  image?: string
  url?: string
  generateOgImage?: boolean
  profile?: {
    username: string
    displayName: string
    bio: string
    avatar: string
    stats: any
    badgeCount: number
  }
}

export function useMeta() {
  const updateMeta = async (meta: MetaData) => {
    // Update title
    if (meta.title) {
      document.title = meta.title
      updateMetaTag('og:title', meta.title)
      updateMetaTag('twitter:title', meta.title)
    }
    
    // Update description
    if (meta.description) {
      updateMetaTag('description', meta.description)
      updateMetaTag('og:description', meta.description)
      updateMetaTag('twitter:description', meta.description)
    }
    
    // Handle dynamic OG image generation
    let imageUrl = meta.image
    if (meta.generateOgImage && meta.profile) {
      imageUrl = await generateOpenGraphImage(meta.profile)
    }
    
    // Update image
    if (imageUrl) {
      updateMetaTag('og:image', imageUrl)
      updateMetaTag('twitter:image', imageUrl)
      updateMetaTag('twitter:card', 'summary_large_image')
    }
    
    // Update URL
    if (meta.url) {
      updateMetaTag('og:url', meta.url)
      updateMetaTag('twitter:url', meta.url)
    }
    
    // Set Open Graph type
    updateMetaTag('og:type', 'profile')
  }

  const generateOpenGraphImage = async (profile: NonNullable<MetaData['profile']>) => {
    try {
      const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL
      if (!supabaseUrl) return profile.avatar

      const params = new URLSearchParams({
        username: profile.username,
        displayName: profile.displayName,
        bio: profile.bio,
        avatar: profile.avatar,
        stats: JSON.stringify(profile.stats),
        badges: profile.badgeCount.toString()
      })

      return `${supabaseUrl}/functions/v1/generate-og-image?${params.toString()}`
    } catch (error) {
      console.error('Error generating OG image:', error)
      return profile.avatar
    }
  }
  
  const updateMetaTag = (property: string, content: string) => {
    // Handle different meta tag types
    let selector = ''
    let attribute = ''
    
    if (property.startsWith('og:') || property.startsWith('twitter:')) {
      selector = `meta[property="${property}"]`
      attribute = 'property'
    } else {
      selector = `meta[name="${property}"]`
      attribute = 'name'
    }
    
    let element = document.querySelector(selector) as HTMLMetaElement
    
    if (element) {
      element.content = content
    } else {
      // Create new meta tag if it doesn't exist
      element = document.createElement('meta')
      element.setAttribute(attribute, property)
      element.content = content
      document.head.appendChild(element)
    }
  }
  
  return {
    updateMeta
  }
}