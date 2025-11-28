import { githubService, type ProcessedProfile as GitHubProfile } from './github'

export interface MergedProfile extends GitHubProfile {
  isClaimed: boolean
  isOwner?: boolean
}

class ProfileService {
  async getProfile(username: string): Promise<MergedProfile> {
    // For now, just use GitHub-only profile
    // TODO: Add local backend API calls for claimed profiles
    const githubProfile = await githubService.getProfile(username)
    return {
      ...githubProfile,
      isClaimed: false
    }
  }
}

export const profileService = new ProfileService()