<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue';
import type { SlideConfig } from '@/config/wrapped-slides';

// Import base components
import Avatar from './wrapped/Avatar.vue';
import SlideTitle from './wrapped/SlideTitle.vue';
import TypewriterText from './wrapped/TypewriterText.vue';
import RevealBox from './wrapped/RevealBox.vue';

// Import background components
import ContributionGraph from './wrapped/backgrounds/ContributionGraph.vue';
import FloatingProjects from './wrapped/backgrounds/FloatingProjects.vue';
import LanguageIcons from './wrapped/backgrounds/LanguageIcons.vue';
import ScrollingCommits from './wrapped/backgrounds/ScrollingCommits.vue';
import FloatingPRs from './wrapped/backgrounds/FloatingPRs.vue';

interface Props {
  config: SlideConfig;
  isActive: boolean;
}

const props = defineProps<Props>();

// Component registry
const componentMap: Record<string, any> = {
  Avatar,
  SlideTitle,
  TypewriterText,
  RevealBox,
  ContributionGraph,
  FloatingProjects,
  LanguageIcons,
  ScrollingCommits,
  FloatingPRs
};

const backgroundComponent = computed(() => {
  return componentMap[props.config.background.component];
});

const getPositionStyle = (position?: { x: string; y: string }) => {
  if (!position) return {};
  
  return {
    position: 'absolute',
    left: position.x,
    top: position.y,
    transform: 'translate(-50%, -50%)'
  };
};
</script>

<template>
  <div 
    class="absolute inset-0 flex flex-col items-center justify-center text-center transition-opacity duration-500 overflow-hidden bg-black text-green-500"
    :class="{ 'opacity-100 z-10': isActive, 'opacity-0 z-0': !isActive }"
  >
    <!-- Background Component -->
    <component 
      :is="backgroundComponent" 
      v-bind="config.background.props || {}"
      :is-active="isActive"
    />
    
    <!-- Slide Components -->
    <component
      v-for="(comp, idx) in config.components"
      :key="idx"
      :is="componentMap[comp.component]"
      v-bind="comp.props"
      :style="getPositionStyle(comp.position)"
      :is-active="isActive"
      class="z-20"
    />
  </div>
</template>
