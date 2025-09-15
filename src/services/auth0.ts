import { createAuth0 } from '@auth0/auth0-vue'

export const auth0Config = {
  domain: (import.meta as any).env?.VITE_AUTH0_DOMAIN,
  clientId: (import.meta as any).env?.VITE_AUTH0_CLIENT_ID,
  authorizationParams: {
    redirect_uri: window.location.origin + '/callback',
    ...(((import.meta as any).env?.VITE_AUTH0_AUDIENCE) && { 
      audience: (import.meta as any).env.VITE_AUTH0_AUDIENCE 
    }),
    scope: 'openid profile email'
  }
}

export interface AuthUser {
  sub: string
  email: string
  name: string
  picture: string
  [key: string]: any
}

export interface ProviderTokens {
  github?: {
    access_token: string
    scope: string
  }
  gitlab?: {
    access_token: string
    scope: string
  }
}

export class AuthService {
  constructor() {}

  async getProviderTokens(accessToken: string): Promise<ProviderTokens> {
    try {
      // Call Auth0 Management API to get social provider tokens
      const response = await fetch(`https://${auth0Config.domain}/api/v2/users/${this.getUserId()}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch provider tokens')
      }

      const userData = await response.json()
      const tokens: ProviderTokens = {}

      // Extract provider-specific tokens from user identities
      if (userData.identities) {
        userData.identities.forEach((identity: any) => {
          if (identity.provider === 'github' && identity.access_token) {
            tokens.github = {
              access_token: identity.access_token,
              scope: identity.scope || ''
            }
          }
          if (identity.provider === 'gitlab' && identity.access_token) {
            tokens.gitlab = {
              access_token: identity.access_token,
              scope: identity.scope || ''
            }
          }
        })
      }

      return tokens
    } catch (error) {
      console.error('Error fetching provider tokens:', error)
      return {}
    }
  }

  private getUserId(): string {
    // This would typically come from the Auth0 user object
    // Implementation depends on how you store the current user
    return ''
  }
}

export const authService = new AuthService()