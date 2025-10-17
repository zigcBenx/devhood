// Reusable Tailwind class combinations following DRY principle
export const useStyles = () => {
  const classes = {
    // Cards and containers
    card: 'bg-gray-900/60 border border-green-500/30 rounded-lg backdrop-blur-sm',
    cardHover: 'hover:border-green-400 hover:bg-gray-800/70 transition-all duration-300',
    cardGlow: 'hover:shadow-[0_0_20px_rgba(0,255,0,0.2)]',

    // Buttons
    btnPrimary: 'px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-black rounded-lg hover:from-green-400 hover:to-green-500 transition-all duration-300 font-semibold shadow-[0_0_20px_rgba(0,255,0,0.3)] hover:shadow-[0_0_30px_rgba(0,255,0,0.5)] transform hover:scale-105',
    btnSecondary: 'px-6 py-3 bg-gray-700 text-green-400 border border-green-500/30 rounded-lg hover:border-green-400 hover:bg-gray-600 transition-all duration-300 font-semibold',
    btnGhost: 'px-4 py-2 bg-gray-900/50 border border-green-500/30 rounded-lg hover:border-green-400 hover:bg-gray-800/70 transition-all duration-300',

    // Text
    textGradient: 'bg-gradient-to-r from-green-400 via-green-300 to-green-500 bg-clip-text text-transparent',
    textGlow: 'drop-shadow-[0_0_10px_rgba(0,255,0,0.3)]',

    // Animations
    pulse: 'animate-pulse',
    glowEffect: 'shadow-[0_0_30px_rgba(0,255,0,0.3)]',

    // Links
    socialLink: 'group relative flex items-center gap-3 px-6 py-3 bg-gray-900/50 border border-green-500/30 rounded-lg hover:border-green-400 hover:bg-gray-800/70 transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,255,0,0.2)] backdrop-blur-sm',

    // Status indicators
    dotIndicator: 'w-2 h-2 rounded-full animate-pulse',

    // Backgrounds
    bgGrid: 'absolute inset-0 bg-[linear-gradient(rgba(0,255,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.03)_1px,transparent_1px)] bg-[size:20px_20px] animate-pulse',
  }

  const combine = (...classNames: string[]) => classNames.join(' ')

  return {
    classes,
    combine,
  }
}
