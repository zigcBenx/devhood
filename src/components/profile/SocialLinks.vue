<template>
  <div v-if="links.length || username" class="flex justify-center gap-6 mb-16 flex-wrap">
    <a
      v-for="link in links"
      :key="link.platform"
      :href="link.url"
      target="_blank"
      rel="noopener noreferrer"
      :class="linkClasses"
    >
      <component :is="getIcon(link.icon)" :class="iconClasses" />
      <span class="text-lg font-semibold text-green-300 group-hover:text-green-200 transition-colors">
        {{ link.platform }}
      </span>
      <div class="absolute inset-0 bg-green-500/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </a>

    <!-- Always show GitHub link -->
    <a
      :href="`https://github.com/${username}`"
      target="_blank"
      rel="noopener noreferrer"
      :class="linkClasses"
    >
      <Github :class="iconClasses" />
      <span class="text-lg font-semibold text-green-300 group-hover:text-green-200 transition-colors">
        GitHub
      </span>
      <div class="absolute inset-0 bg-green-500/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </a>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Github, Globe, Twitter } from 'lucide-vue-next'
import { useStyles } from '@/composables/useStyles'

interface SocialLink {
  platform: string
  url: string
  icon: string
}

interface Props {
  links: SocialLink[]
  username: string
}

const props = defineProps<Props>()
const { classes } = useStyles()

const linkClasses = computed(() => classes.socialLink)
const iconClasses = computed(() =>
  'h-6 w-6 text-green-400 group-hover:text-green-300 transition-all duration-300 group-hover:scale-110'
)

const iconMap = {
  Globe,
  Twitter,
  Github,
}

const getIcon = (iconName: string) => {
  return iconMap[iconName as keyof typeof iconMap] || Globe
}
</script>
