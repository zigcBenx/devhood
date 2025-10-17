import { ref, computed } from 'vue'
import { profileService, type MergedProfile, type BadgeWithProgress } from '@/services/profile'
import { apiService } from '@/services/api'

export const useProfile = (username: string, userId?: string) => {
  const loading = ref(false)
  const error = ref('')
  const profile = ref<MergedProfile | null>(null)
  const badges = ref<BadgeWithProgress[]>([])
  const profileStatus = ref<{ claimed: boolean; connections: Array<{ provider: string; username: string }> } | null>(null)

  const fetchProfile = async () => {
    loading.value = true
    error.value = ''

    try {
      // Check if profile is claimed
      try {
        profileStatus.value = await apiService.getProfileStatus(username)
      } catch (statusErr) {
        console.log('Failed to check profile status:', statusErr)
        profileStatus.value = { claimed: false, connections: [] }
      }

      profile.value = await profileService.getProfile(username, userId)

      // Load badges for claimed profiles
      if (profile.value.isClaimed) {
        badges.value = await profileService.getBadgesWithProgress(
          profile.value.badges.length > 0 ? profile.value.badges[0].profile_id : undefined
        )
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load profile'
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    profile,
    badges,
    profileStatus,
    fetchProfile,
  }
}
