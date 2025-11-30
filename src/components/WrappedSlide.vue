<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  layout?: 'intro' | 'stat-big' | 'stat-grid' | 'rank' | 'outro' | 'list' | 'code-snippet' | 'cinematic' | 'default';
  title: string;
  subtitle?: string;
  stat?: string | number;
  statLabel?: string;
  description?: string;
  bgColor?: string;
  textColor?: string;
  image?: string;
  isActive: boolean;
  // For stat-grid
  stats?: Array<{ label: string; value: string | number }>;
  // For rank
  rankIcon?: string;
  // New prop for background effects
  bgEffect?: 'contributions' | 'stars' | 'code' | 'confetti' | 'pulse' | 'rockets' | 'network' | 'hacker-profile' | 'unfinished-projects' | 'languages' | 'archives' | 'pull-requests' | 'none';
  duration?: number;
  highlightText?: string;
  // For list layout
  // For list layout
  listItems?: Array<{ label: string; value: string }>;
  // For code-snippet layout
  codeContent?: string;
}

const props = withDefaults(defineProps<Props>(), {
  layout: 'default',
  bgColor: 'bg-gray-900',
  textColor: 'text-white',
  bgEffect: 'none',
});

const slideStyle = computed(() => {
  // Don't use image as background for cinematic layout
  if (props.layout === 'cinematic') return {};
  
  return props.image 
    ? { backgroundImage: `url(${props.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : {};
});

// Animation classes based on layout
const titleClass = computed(() => {
  switch (props.layout) {
    case 'intro': return 'text-5xl md:text-7xl font-black mb-6 tracking-tighter animate-slide-in-left';
    case 'stat-big': return 'text-2xl md:text-3xl font-bold mb-8 uppercase tracking-widest opacity-80 animate-fade-in';
    case 'outro': return 'text-4xl md:text-6xl font-black mb-4 animate-scale-in';
    default: return 'text-3xl md:text-4xl font-bold mb-4 animate-fade-in-up';
  }
});

const statClass = computed(() => {
  switch (props.layout) {
    case 'stat-big': return 'text-7xl md:text-9xl font-black mb-4 tracking-tighter gradient-text animate-scale-up-bounce';
    case 'rank': return 'text-6xl md:text-8xl font-black mb-2 text-yellow-400 animate-pulse-slow';
    default: return 'text-6xl md:text-7xl font-black mb-2 tracking-tighter gradient-text';
  }
});

// Generate random positions for stars/confetti
const randomItems = (count: number) => Array.from({ length: count }, (_, i) => ({
  id: i,
  style: {
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 2}s`,
    animationDuration: `${2 + Math.random() * 3}s`
  }
}));

const stars = randomItems(50);
const confetti = randomItems(30);
const codeSnippets = [
  'const', 'function', 'import', 'return', 'await', 'class', 'if', 'else', 'try', 'catch',
  '=>', '{}', '[]', 'async', 'export', 'interface', 'type', 'void', 'null', 'true'
].map((text, i) => ({
  text,
  style: {
    left: `${Math.random() * 90}%`,
    animationDelay: `${Math.random() * 5}s`,
    fontSize: `${10 + Math.random() * 10}px`
  }
}));

// Cringe commit messages - Fixed spots
const fixedPositions = ['15%', '35%', '65%', '85%'];
const commitMessages = [
  "git commit -m 'fix'",
  "git commit -m 'wip'",
  "git commit -m 'oops'",
  "git commit -m 'final final fix'",
  "git commit -m 'please work'",
  "git commit -m 'remove console.log'",
  "git commit -m 'stuff'",
  "git commit -m 'why'",
  "git commit -m 'fixed bug'",
  "git commit -m 'updates'",
  "git commit -m 'typo'",
  "git commit -m 'merged'",
  "git commit -m 'revert'",
  "git commit -m 'broken'",
  "git commit -m 'save point'"
].map((text, i) => ({
  text,
  style: {
    left: fixedPositions[i % 4], // Cycle through 4 fixed horizontal positions
    top: '100%',
    animationDelay: `${Math.random() * 10}s`, // Random delay
    fontSize: `${24 + Math.random() * 12}px` // Slightly smaller max size for better fit
  }
}));

// Graph Animation
const graphPath = "M0 100 Q 20 90, 40 70 T 80 40 T 120 20 T 160 10 T 200 5"; // Simple curve going up

// Unfinished Projects Animation
const projectNames = [
  'final-project', 'test-app', 'idea-1', 'startup-idea', 'todo-app', 
  'weather-app', 'chat-app', 'portfolio-v3', 'learn-rust', 'ai-wrapper',
  'crypto-bot', 'blog-v2', 'social-network', 'game-engine', 'utils'
].map((text, i) => ({
  text,
  style: {
    left: `${Math.random() * 80 + 10}%`,
    top: `${Math.random() * 80 + 10}%`,
    animationDelay: `${Math.random() * 5}s`,
    fontSize: `${14 + Math.random() * 10}px`
  }
}));

// Languages Animation
const languageIcons = [
  'JS', 'TS', 'PY', 'RS', 'GO', 'JAVA', 'C++', 'PHP', 'RB', 'SWIFT', 
  'KOTLIN', 'C#', 'HTML', 'CSS', 'SQL', 'VUE', 'REACT', 'ANGULAR'
].map((text, i) => ({
  text,
  style: {
    left: `${Math.random() * 90}%`,
    top: `${Math.random() * 90}%`,
    animationDelay: `${Math.random() * 5}s`,
    fontSize: `${20 + Math.random() * 20}px`,
    opacity: 0.3
  }
}));



// Archives Animation
const archiveCommits = Array.from({ length: 20 }, (_, i) => {
  const hash = Math.random().toString(16).substring(2, 9);
  const msgs = ['fix', 'wip', 'update', 'refactor', 'style', 'docs', 'test', 'merge', 'revert', 'init'];
  const msg = msgs[Math.floor(Math.random() * msgs.length)];
  return {
    text: `[${hash}] ${msg}`,
    style: {
      left: `${Math.random() * 60 + 20}%`, // Center-ish
      animationDelay: `${Math.random() * 5}s`,
      opacity: 0.1 + Math.random() * 0.2
    }
  };
});



// PR Animation
const prItems = [
  'PR #102', 'Merged', 'Conflict', 'Review', 'Approved', 'Changes Requested', 
  'PR #404', 'Force Push', 'Rebase', 'Squash', 'Cherry-pick', 'LGTM'
].map((text, i) => ({
  text,
  style: {
    left: `${Math.random() * 90}%`,
    top: `${Math.random() * 90}%`,
    animationDelay: `${Math.random() * 5}s`,
    fontSize: `${16 + Math.random() * 14}px`,
    opacity: 0.2
  }
}));

// Typewriter Effect Logic
import { ref, watch } from 'vue';

const displayedText = ref('');
const showCursor = ref(true);
const isTypingDone = ref(false);
const showHighlight = ref(false);

const startTypewriter = async (text: string) => {
  displayedText.value = '';
  isTypingDone.value = false;
  showCursor.value = true;
  showHighlight.value = false;
  
  // Initial delay before typing starts (3s as requested)
  await new Promise(resolve => setTimeout(resolve, 3000));

  const chars = text.split('');
  for (let i = 0; i < chars.length; i++) {
    displayedText.value += chars[i];
    // Randomize typing speed slightly for realism
    await new Promise(resolve => setTimeout(resolve, 30 + Math.random() * 20));
  }
  
  isTypingDone.value = true;
  // Blink cursor for a bit then hide
  setTimeout(() => { showCursor.value = false; }, 2000);
  
  // Reveal highlight text if it exists
  if (props.highlightText) {
     setTimeout(() => { showHighlight.value = true; }, 1000);
  }
};

watch(() => props.isActive, (newVal) => {
  if (newVal && props.layout === 'cinematic' && props.description) {
    startTypewriter(props.description);
  } else {
    displayedText.value = '';
    showHighlight.value = false;
  }
}, { immediate: true });

</script>

<template>
  <div 
    class="absolute inset-0 flex flex-col items-center justify-center p-8 text-center transition-opacity duration-500 overflow-hidden"
    :class="[bgColor, textColor, { 'opacity-100 z-10': isActive, 'opacity-0 z-0': !isActive }]"
    :style="slideStyle"
  >
    <!-- Background Effects -->
    <div v-if="image" class="absolute inset-0 bg-black/60 z-0"></div>
    <div v-else class="absolute inset-0 bg-gradient-to-b from-transparent to-black/30 z-0"></div>
    
    <!-- Dynamic Background Animations -->
    <div v-if="bgEffect === 'contributions'" class="absolute inset-0 z-0 opacity-20 overflow-hidden">
      <!-- Scaled up grid -->
      <div class="grid grid-cols-[repeat(52,1fr)] gap-0.5 transform -rotate-12 scale-[2.5] opacity-30 origin-center">
        <div v-for="i in 400" :key="i" 
             class="w-2 h-2 rounded-none animate-pulse-random"
             :class="['bg-green-500', 'bg-green-400', 'bg-green-600', 'bg-green-300'][Math.floor(Math.random() * 4)]"
             :style="{ animationDelay: `${Math.random() * 2}s` }"
        ></div>
      </div>
      
      <!-- Floating Commit Messages -->
      <div class="absolute inset-0 overflow-hidden font-mono">
        <div v-for="(msg, i) in commitMessages" :key="i"
             class="absolute text-green-300/40 whitespace-nowrap animate-float-commit font-bold"
             :style="msg.style"
        >
          {{ msg.text }}
        </div>
      </div>
    </div>

    <div v-if="bgEffect === 'stars'" class="absolute inset-0 z-0 overflow-hidden">
      <div v-for="star in stars" :key="star.id"
           class="absolute w-1 h-1 bg-white rounded-full animate-twinkle"
           :style="star.style"
      ></div>
      <div class="absolute top-0 left-0 w-full h-full animate-shooting-star"></div>
    </div>

    <div v-if="bgEffect === 'code'" class="absolute inset-0 z-0 overflow-hidden opacity-20 font-mono">
      <div v-for="(code, i) in codeSnippets" :key="i"
           class="absolute text-green-400 animate-float-up"
           :style="code.style"
      >
        {{ code.text }}
      </div>
    </div>

    <div v-if="bgEffect === 'confetti'" class="absolute inset-0 z-0 overflow-hidden">
      <div v-for="c in confetti" :key="c.id"
           class="absolute w-2 h-2 rounded-sm animate-fall"
           :class="['bg-red-500', 'bg-blue-500', 'bg-yellow-500', 'bg-green-500', 'bg-purple-500'][Math.floor(Math.random() * 5)]"
           :style="c.style"
      ></div>
    </div>

    <!-- Rocket removed as requested -->

    <div v-if="bgEffect === 'network'" class="absolute inset-0 z-0 overflow-hidden opacity-40">
       <!-- Growing Graph Animation -->
       <svg class="absolute inset-0 w-full h-full" viewBox="0 0 200 100" preserveAspectRatio="none">
         <defs>
           <linearGradient id="graphGradient" x1="0" y1="0" x2="0" y2="1">
             <stop offset="0%" stop-color="rgba(255, 255, 255, 0.5)" />
             <stop offset="100%" stop-color="rgba(255, 255, 255, 0)" />
           </linearGradient>
         </defs>
         <!-- Area under the curve -->
         <path d="M0 100 Q 20 90, 40 70 T 80 40 T 120 20 T 160 10 T 200 5 V 100 H 0 Z" 
               fill="url(#graphGradient)" 
               class="animate-graph-area" />
         <!-- The Line -->
         <path :d="graphPath" 
               fill="none" 
               stroke="white" 
               stroke-width="2" 
               stroke-linecap="round"
               class="animate-draw-graph" />
       </svg>
    </div>

    <div v-if="bgEffect === 'hacker-profile'" class="absolute inset-0 z-0 overflow-hidden">
       <!-- Straight grid, filling like progress bar -->
       <div class="absolute inset-0 opacity-30 flex flex-wrap content-start">
          <div v-for="i in 800" :key="i" 
               class="w-4 h-4 m-[1px] rounded-[1px] transition-colors duration-300"
               :class="[
                 'bg-gray-800', 
                 { 'animate-fill-square': isActive }
               ]"
               :style="{ 
                 animationDelay: `${(i / 800) * (duration ? duration / 1000 : 5)}s`,
                 animationFillMode: 'forwards'
               }"
          ></div>
       </div>
       <!-- Scanline effect -->
       <div class="absolute inset-0 bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==')] opacity-10 pointer-events-none z-10"></div>
       <div class="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/50 pointer-events-none z-10"></div>
    </div>

    <div v-if="bgEffect === 'unfinished-projects'" class="absolute inset-0 z-0 overflow-hidden">
       <div v-for="(proj, i) in projectNames" :key="i"
            class="absolute text-gray-500/30 font-mono animate-float-random flex items-center gap-2"
            :style="proj.style"
       >
         <span>📁</span> {{ proj.text }}
       </div>
       <!-- Scanline effect -->
       <div class="absolute inset-0 bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==')] opacity-10 pointer-events-none z-10"></div>
    </div>

    <div v-if="bgEffect === 'languages'" class="absolute inset-0 z-0 overflow-hidden">
       <div v-for="(lang, i) in languageIcons" :key="i"
            class="absolute text-green-500/20 font-black animate-pulse-random"
            :style="lang.style"
       >
         {{ lang.text }}
       </div>
       <!-- Scanline effect -->
       <div class="absolute inset-0 bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==')] opacity-10 pointer-events-none z-10"></div>
    </div>

    <div v-if="bgEffect === 'archives'" class="absolute inset-0 z-0 overflow-hidden font-mono text-xs">
       <div v-for="(commit, i) in archiveCommits" :key="i"
            class="absolute text-green-500/30 whitespace-nowrap animate-scroll-up"
            :style="commit.style"
       >
         {{ commit.text }}
       </div>
       <!-- Scanline effect -->
       <div class="absolute inset-0 bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==')] opacity-10 pointer-events-none z-10"></div>
    </div>

    <div v-if="bgEffect === 'pull-requests'" class="absolute inset-0 z-0 overflow-hidden">
       <div v-for="(item, i) in prItems" :key="i"
            class="absolute text-red-500/20 font-bold animate-float-random"
            :style="item.style"
       >
         {{ item.text }}
       </div>
       <!-- Scanline effect -->
       <div class="absolute inset-0 bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==')] opacity-10 pointer-events-none z-10"></div>
    </div>
    
    <!-- Content Container -->
    <div class="relative z-10 max-w-2xl w-full flex flex-col items-center">
      
      <!-- INTRO LAYOUT -->
      <template v-if="layout === 'intro'">
        <div class="mb-8 animate-float">
          <span class="text-6xl">🎁</span>
        </div>
        <h2 :class="titleClass">{{ title }}</h2>
        <p class="text-2xl font-light opacity-90 animate-fade-in-delay-1">{{ subtitle }}</p>
        <div class="mt-12 animate-pulse">
          <span class="px-6 py-3 bg-white/20 rounded-full text-sm font-bold uppercase tracking-widest backdrop-blur-sm">
            Tap to unwrap
          </span>
        </div>
      </template>

      <!-- BIG STAT LAYOUT -->
      <template v-else-if="layout === 'stat-big'">
        <h2 :class="titleClass">{{ title }}</h2>
        <div class="my-4">
          <div :class="statClass">{{ stat }}</div>
          <div class="text-xl md:text-2xl font-medium opacity-90 mt-2 animate-fade-in-delay-1">{{ statLabel }}</div>
        </div>
        <p v-if="description" class="text-lg leading-relaxed opacity-80 mt-8 max-w-md mx-auto animate-fade-in-delay-2">
          {{ description }}
        </p>
      </template>

      <!-- RANK LAYOUT -->
      <template v-else-if="layout === 'rank'">
        <div class="text-8xl mb-6 animate-bounce-custom">{{ rankIcon || '🏆' }}</div>
        <h2 :class="titleClass">{{ title }}</h2>
        <div class="my-6 p-6 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20 transform rotate-1 hover:rotate-0 transition-transform duration-300">
          <div :class="statClass">{{ stat }}</div>
          <div class="text-xl uppercase tracking-widest font-bold">{{ statLabel }}</div>
        </div>
        <p class="text-xl font-medium mt-4 animate-fade-in-delay-1">{{ description }}</p>
      </template>

      <!-- STAT GRID LAYOUT -->
      <template v-else-if="layout === 'stat-grid'">
        <h2 :class="titleClass">{{ title }}</h2>
        <div class="grid grid-cols-2 gap-4 w-full mt-8">
          <div 
            v-for="(item, idx) in stats" 
            :key="idx"
            class="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10 flex flex-col items-center justify-center aspect-square animate-stagger-in"
            :style="{ animationDelay: `${idx * 150}ms` }"
          >
            <div class="text-3xl md:text-4xl font-bold mb-1">{{ item.value }}</div>
            <div class="text-xs md:text-sm uppercase opacity-70">{{ item.label }}</div>
          </div>
        </div>
        <p class="mt-8 opacity-80">{{ description }}</p>
      </template>

      <!-- LIST LAYOUT -->
      <template v-else-if="layout === 'list'">
        <h2 :class="titleClass">{{ title }}</h2>
        <div class="w-full max-w-md mt-8 space-y-4">
          <div v-for="(item, idx) in listItems" :key="idx" 
               class="flex items-center justify-between p-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10 animate-slide-in-left hover:bg-white/20 transition-colors"
               :style="{ animationDelay: `${idx * 200}ms` }">
             <span class="text-xl font-bold">{{ item.label }}</span>
             <span class="text-lg opacity-80 text-right">{{ item.value }}</span>
          </div>
        </div>
        <p v-if="description" class="mt-8 text-lg opacity-80">{{ description }}</p>
      </template>

      <!-- CODE SNIPPET LAYOUT -->
      <template v-else-if="layout === 'code-snippet'">
        <h2 :class="titleClass">{{ title }}</h2>
        <div class="w-full max-w-2xl mt-8 p-6 bg-gray-900 rounded-xl font-mono text-sm text-left overflow-hidden border border-gray-700 shadow-2xl animate-scale-in relative transform rotate-1 hover:rotate-0 transition-transform duration-500">
          <div class="absolute top-0 left-0 w-full h-8 bg-gray-800 flex items-center px-4 gap-2">
             <div class="w-3 h-3 rounded-full bg-red-500"></div>
             <div class="w-3 h-3 rounded-full bg-yellow-500"></div>
             <div class="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <pre class="mt-4 text-green-400 overflow-x-auto whitespace-pre-wrap"><code>{{ codeContent }}</code></pre>
        </div>
        <p class="mt-8 text-xl italic opacity-80 animate-fade-in-delay-2">{{ description }}</p>
      </template>

      <!-- OUTRO LAYOUT -->
      <template v-else-if="layout === 'outro'">
        <h2 :class="titleClass">{{ title }}</h2>
        <p class="text-xl mb-12 opacity-90">{{ subtitle }}</p>
        
        <div class="grid grid-cols-2 gap-4 w-full max-w-sm mb-8">
          <div class="bg-gray-800 p-4 rounded-lg text-center">
            <div class="text-2xl font-bold text-green-400">{{ stat }}</div>
            <div class="text-xs opacity-60">Contributions</div>
          </div>
          <div class="bg-gray-800 p-4 rounded-lg text-center">
            <div class="text-2xl font-bold text-purple-400">{{ description }}</div> <!-- Reusing props for summary stats -->
            <div class="text-xs opacity-60">Top Lang</div>
          </div>
        </div>

        <button class="px-8 py-4 bg-white text-black rounded-full font-bold text-lg hover:scale-105 transition-transform animate-pulse-slow">
          Share Your Wrap 📤
        </button>
      </template>

      <!-- CINEMATIC LAYOUT -->
      <template v-else-if="layout === 'cinematic'">
        <div class="flex flex-col items-center justify-center h-full max-w-4xl px-4 relative z-20">
          <div class="mb-8 relative">
             <!-- Avatar Glow Effect -->
             <div class="absolute -inset-4 bg-green-500/20 blur-xl rounded-full animate-pulse-slow"></div>
             <img v-if="image" :src="image" class="w-32 h-32 rounded-full border-2 border-green-500/50 shadow-[0_0_20px_rgba(34,197,94,0.3)] relative z-10" />
          </div>
          
          <h2 class="text-5xl md:text-7xl font-black mb-12 tracking-tighter animate-fade-in-slow opacity-0 text-green-500 drop-shadow-[0_0_10px_rgba(34,197,94,0.5)] font-mono" :style="{ animationDelay: '0s', animationDuration: '3s', animationFillMode: 'forwards' }">
            {{ title }}
          </h2>
          
          <div class="relative text-2xl md:text-4xl font-light leading-relaxed text-left opacity-90 font-mono min-h-[200px] text-green-400/90">
            <span>{{ displayedText }}</span>
            <span v-if="showCursor" class="animate-blink inline-block w-3 h-8 bg-green-500 ml-1 align-middle shadow-[0_0_10px_rgba(34,197,94,0.8)]"></span>
            
            <div v-if="showHighlight" class="mt-12 text-center animate-scale-up-bounce">
              <div class="inline-block p-6 border-2 border-green-500 rounded-lg bg-black/80 shadow-[0_0_30px_rgba(34,197,94,0.4)] transform rotate-1">
                <div class="text-sm text-green-500/60 mb-2 uppercase tracking-widest">Commit Hash: 8badf00d</div>
                <div class="text-4xl md:text-6xl font-black text-white italic">"{{ highlightText }}"</div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- DEFAULT LAYOUT -->
      <template v-else>
        <h2 :class="titleClass">{{ title }}</h2>
        <p v-if="subtitle" class="text-xl opacity-90 mb-8">{{ subtitle }}</p>
        
        <div v-if="stat" class="my-8 transform transition-transform hover:scale-110 duration-300">
          <div :class="statClass">{{ stat }}</div>
          <div class="text-lg uppercase tracking-widest opacity-80 font-medium">{{ statLabel }}</div>
        </div>
        
        <p v-if="description" class="text-lg leading-relaxed opacity-90 mt-4">{{ description }}</p>
      </template>

    </div>
  </div>
</template>

<style scoped>
.gradient-text {
  background: linear-gradient(135deg, #fff 0%, #a5b4fc 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Animations */
.animate-fade-in-up { animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
.animate-fade-in { animation: fadeIn 1s ease-out forwards; opacity: 0; }
.animate-fade-in-delay-1 { animation: fadeIn 1s ease-out 0.3s forwards; opacity: 0; }
.animate-fade-in-delay-2 { animation: fadeIn 1s ease-out 0.6s forwards; opacity: 0; }
.animate-slide-in-left { animation: slideInLeft 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
.animate-scale-up-bounce { animation: scaleUpBounce 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; opacity: 0; }
.animate-scale-in { animation: scaleIn 0.6s ease-out forwards; opacity: 0; }
.animate-float { animation: float 3s ease-in-out infinite; }
.animate-pulse-slow { animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
.animate-bounce-custom { animation: bounce 2s infinite; }
.animate-stagger-in { animation: scaleIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; transform: scale(0.8); }
.animate-fade-in-slow { animation: fadeIn 3s ease-out forwards; }
.animate-blink { animation: blink 1s step-end infinite; }

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

@keyframes fillSquare {
  0% { background-color: rgb(31, 41, 55); } /* gray-800 */
  100% { background-color: rgb(34, 197, 94); } /* green-500 */
}

.animate-fill-square {
  animation: fillSquare 1s ease-out forwards;
}

.animate-float-random {
  animation: floatRandom 10s ease-in-out infinite;
}

@keyframes floatRandom {
  0%, 100% { transform: translate(0, 0); }
  25% { transform: translate(10px, -10px); }
  50% { transform: translate(-5px, 15px); }
  75% { transform: translate(-15px, -5px); }
}

.animate-scroll-up {
  animation: scrollUp 10s linear infinite;
}

@keyframes scrollUp {
  from { transform: translateY(100vh); opacity: 0; }
  10% { opacity: 0.3; }
  90% { opacity: 0.3; }
  to { transform: translateY(-20vh); opacity: 0; }
}

/* Background Animations */
.animate-pulse-random { animation: pulseRandom 2s infinite; }
.animate-twinkle { animation: twinkle 3s infinite; }
.animate-float-up { animation: floatUp 10s linear infinite; }
.animate-fall { animation: fall 5s linear infinite; }
.animate-float-commit { animation: floatCommit 15s linear infinite; }

/* Graph Animations */
.animate-draw-graph {
  stroke-dasharray: 1000;
  stroke-dashoffset: 1000;
  animation: drawGraph 3s ease-out forwards;
}
.animate-graph-area {
  opacity: 0;
  animation: fadeInGraph 3s ease-out forwards;
  animation-delay: 0.5s;
}

@keyframes drawGraph {
  to { stroke-dashoffset: 0; }
}
@keyframes fadeInGraph {
  to { opacity: 1; }
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideInLeft {
  from { opacity: 0; transform: translateX(-50px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes scaleUpBounce {
  from { opacity: 0; transform: scale(0.5); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

@keyframes bounce {
  0%, 100% { transform: translateY(-5%); animation-timing-function: cubic-bezier(0.8,0,1,1); }
  50% { transform: translateY(0); animation-timing-function: cubic-bezier(0,0,0.2,1); }
}

@keyframes pulseRandom {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.8; }
}

@keyframes twinkle {
  0%, 100% { opacity: 0.2; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.2); }
}

@keyframes floatUp {
  from { transform: translateY(100vh); opacity: 0; }
  10% { opacity: 0.5; }
  90% { opacity: 0.5; }
  to { transform: translateY(-10vh); opacity: 0; }
}

@keyframes fall {
  from { transform: translateY(-10vh) rotate(0deg); }
  to { transform: translateY(100vh) rotate(360deg); }
}

@keyframes floatCommit {
  0% { transform: translateY(110vh) translateX(-20px); opacity: 0; }
  10% { opacity: 0.8; }
  85% { opacity: 0.8; }
  100% { transform: translateY(-10vh) translateX(20px); opacity: 0; }
}

/* Shooting Star */
@keyframes shootingStar {
  0% { transform: translateX(-100%) translateY(0) rotate(-45deg); opacity: 1; }
  100% { transform: translateX(200%) translateY(200%) rotate(-45deg); opacity: 0; }
}
.animate-shooting-star {
  background: linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 50%, rgba(255,255,255,0) 100%);
  height: 2px;
  width: 100px;
  position: absolute;
  top: 20%;
  left: -20%;
  animation: shootingStar 5s infinite;
  animation-delay: 2s;
}
</style>
