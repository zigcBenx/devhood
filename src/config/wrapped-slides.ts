export interface SlideComponent {
    component: string;
    props: Record<string, any>;
    position?: { x: string; y: string };
    delay?: number;
}

export interface SlideConfig {
    id: string;
    duration: number;
    background: {
        component: string;
        props?: Record<string, any>;
    };
    components: SlideComponent[];
}

interface ProfileData {
    avatar: string;
    contributions: string;
    repos: string;
    stars: string;
    topLanguage: string;
    booksWritten: number;
    locEstimate: number;
}

export function generateSlideConfigs(data: ProfileData): SlideConfig[] {
    const { avatar, contributions, repos, topLanguage, booksWritten, locEstimate } = data;

    return [
        // Slide 1: The Developer Awakens
        {
            id: 'developer-awakens',
            duration: 3000 + (`In 2025, you wrote ${contributions} lines of code, enough to fill ${booksWritten} Harry Potter books, ${Math.floor(locEstimate / 300)} Wikipedia pages, or exactly 1 frustrated senior engineer's tears.`.length * 50) + 2000,
            background: {
                component: 'ContributionGraph',
                props: {
                    fillDuration: 3000 + (`In 2025, you wrote ${contributions} lines of code, enough to fill ${booksWritten} Harry Potter books, ${Math.floor(locEstimate / 300)} Wikipedia pages, or exactly 1 frustrated senior engineer's tears.`.length * 50) + 2000
                }
            },
            components: [
                {
                    component: 'Avatar',
                    props: { src: avatar, glow: true, size: 'md' },
                    position: { x: '50%', y: '15%' },
                    delay: 0
                },
                {
                    component: 'SlideTitle',
                    props: {
                        text: 'The Developer Awakens',
                        animation: 'fade',
                        duration: 3000
                    },
                    position: { x: '50%', y: '30%' },
                    delay: 0
                },
                {
                    component: 'TypewriterText',
                    props: {
                        text: `In 2025, you wrote ${contributions} lines of code, enough to fill ${booksWritten} Harry Potter books, ${Math.floor(locEstimate / 300)} Wikipedia pages, or exactly 1 frustrated senior engineer's tears.`,
                        speed: 50,
                        cursor: true
                    },
                    position: { x: '50%', y: '50%' },
                    delay: 3000
                }
            ]
        },

        // Slide 2: The Project Hoarder
        {
            id: 'project-hoarder',
            duration: 3000 + (`You know when you said you'd stop creating new projects and focus on just one? You are currently juggling ${repos} repositories. The terminal determined that was a lie.`.length * 50) + 2000,
            background: {
                component: 'FloatingProjects'
            },
            components: [
                {
                    component: 'Avatar',
                    props: { src: avatar, glow: true, size: 'md' },
                    position: { x: '50%', y: '15%' },
                    delay: 0
                },
                {
                    component: 'SlideTitle',
                    props: {
                        text: "The 'Final' Project",
                        animation: 'fade',
                        duration: 3000
                    },
                    position: { x: '50%', y: '30%' },
                    delay: 0
                },
                {
                    component: 'TypewriterText',
                    props: {
                        text: `You know when you said you'd stop creating new projects and focus on just one? You are currently juggling ${repos} repositories. The terminal determined that was a lie.`,
                        speed: 50,
                        cursor: true
                    },
                    position: { x: '50%', y: '50%' },
                    delay: 3000
                }
            ]
        },

        // Slide 3: The Weapon of Choice
        {
            id: 'weapon-of-choice',
            duration: 3000 + (`You pledged your allegiance to ${topLanguage}. Through merge conflicts and runtime errors, you stayed loyal. It's almost romantic. In a Stockholm Syndrome kind of way.`.length * 50) + 2000,
            background: {
                component: 'LanguageIcons'
            },
            components: [
                {
                    component: 'Avatar',
                    props: { src: avatar, glow: true, size: 'md' },
                    position: { x: '50%', y: '15%' },
                    delay: 0
                },
                {
                    component: 'SlideTitle',
                    props: {
                        text: 'The Weapon of Choice',
                        animation: 'fade',
                        duration: 3000
                    },
                    position: { x: '50%', y: '30%' },
                    delay: 0
                },
                {
                    component: 'TypewriterText',
                    props: {
                        text: `You pledged your allegiance to ${topLanguage}. Through merge conflicts and runtime errors, you stayed loyal. It's almost romantic. In a Stockholm Syndrome kind of way.`,
                        speed: 50,
                        cursor: true
                    },
                    position: { x: '50%', y: '50%' },
                    delay: 3000
                }
            ]
        },

        // Slide 4: The Archives
        {
            id: 'the-archives',
            duration: 3000 + ("Are you embarrassed by your commit naming conventions? We looked through your history... and the terminal found this gem...".length * 50) + 4000,
            background: {
                component: 'ScrollingCommits'
            },
            components: [
                {
                    component: 'Avatar',
                    props: { src: avatar, glow: true, size: 'md' },
                    position: { x: '50%', y: '15%' },
                    delay: 0
                },
                {
                    component: 'SlideTitle',
                    props: {
                        text: 'The Archives',
                        animation: 'fade',
                        duration: 3000
                    },
                    position: { x: '50%', y: '30%' },
                    delay: 0
                },
                {
                    component: 'TypewriterText',
                    props: {
                        text: "Are you embarrassed by your commit naming conventions? We looked through your history... and the terminal found this gem...",
                        speed: 50,
                        cursor: true
                    },
                    position: { x: '50%', y: '50%' },
                    delay: 3000
                },
                {
                    component: 'RevealBox',
                    props: {
                        content: 'fix stuff',
                        animation: 'scale'
                    },
                    position: { x: '50%', y: '70%' },
                    delay: 3000 + ("Are you embarrassed by your commit naming conventions? We looked through your history... and the terminal found this gem...".length * 50) + 1000
                }
            ]
        },

        // Slide 5: Living on the Edge
        {
            id: 'living-on-edge',
            duration: 3000 + ("We found a PR that touched 84 files. You bypassed the checks. You ignored the warnings. You are an agent of chaos.".length * 50) + 4000,
            background: {
                component: 'FloatingPRs'
            },
            components: [
                {
                    component: 'Avatar',
                    props: { src: avatar, glow: true, size: 'md' },
                    position: { x: '50%', y: '15%' },
                    delay: 0
                },
                {
                    component: 'SlideTitle',
                    props: {
                        text: 'Living on the Edge',
                        animation: 'fade',
                        duration: 3000
                    },
                    position: { x: '50%', y: '30%' },
                    delay: 0
                },
                {
                    component: 'TypewriterText',
                    props: {
                        text: "We found a PR that touched 84 files. You bypassed the checks. You ignored the warnings. You are an agent of chaos.",
                        speed: 50,
                        cursor: true
                    },
                    position: { x: '50%', y: '50%' },
                    delay: 3000
                },
                {
                    component: 'RevealBox',
                    props: {
                        content: 'Merged to Main',
                        animation: 'scale'
                    },
                    position: { x: '50%', y: '70%' },
                    delay: 3000 + ("We found a PR that touched 84 files. You bypassed the checks. You ignored the warnings. You are an agent of chaos.".length * 50) + 1000
                }
            ]
        },

        // Slide 6: The Rhythm
        {
            id: 'the-rhythm',
            duration: 8000,
            background: {
                component: 'ContributionGraph',
                props: { fillDuration: 8000 }
            },
            components: [
                {
                    component: 'Avatar',
                    props: { src: avatar, glow: true, size: 'md' },
                    position: { x: '50%', y: '15%' },
                    delay: 0
                },
                {
                    component: 'SlideTitle',
                    props: {
                        text: 'Your Rhythm',
                        animation: 'fade',
                        duration: 3000
                    },
                    position: { x: '50%', y: '30%' },
                    delay: 0
                },
                {
                    component: 'TypewriterText',
                    props: {
                        text: `You contributed ${contributions} times this year. Some say you touched grass... your terminal disagrees.`,
                        speed: 50,
                        cursor: true
                    },
                    position: { x: '50%', y: '50%' },
                    delay: 3000
                }
            ]
        },

        // Slide 7: The Impact
        {
            id: 'the-impact',
            duration: 8000,
            background: {
                component: 'FloatingProjects'
            },
            components: [
                {
                    component: 'Avatar',
                    props: { src: avatar, glow: true, size: 'md' },
                    position: { x: '50%', y: '15%' },
                    delay: 0
                },
                {
                    component: 'SlideTitle',
                    props: {
                        text: 'Butterfly Effect',
                        animation: 'fade',
                        duration: 3000
                    },
                    position: { x: '50%', y: '30%' },
                    delay: 0
                },
                {
                    component: 'TypewriterText',
                    props: {
                        text: `Your code touched ${repos} repositories. That's impact. That's legacy. That's chaos. 🦋`,
                        speed: 50,
                        cursor: true
                    },
                    position: { x: '50%', y: '50%' },
                    delay: 3000
                }
            ]
        },

        // Slide 8: The Class
        {
            id: 'the-class',
            duration: 8000,
            background: {
                component: 'LanguageIcons'
            },
            components: [
                {
                    component: 'Avatar',
                    props: { src: avatar, glow: true, size: 'md' },
                    position: { x: '50%', y: '15%' },
                    delay: 0
                },
                {
                    component: 'SlideTitle',
                    props: {
                        text: 'Your RPG Class',
                        animation: 'fade',
                        duration: 3000
                    },
                    position: { x: '50%', y: '30%' },
                    delay: 0
                },
                {
                    component: 'TypewriterText',
                    props: {
                        text: 'The Builder. You build things. Good things. Sometimes questionable things. But things nonetheless.',
                        speed: 50,
                        cursor: true
                    },
                    position: { x: '50%', y: '50%' },
                    delay: 3000
                }
            ]
        },

        // Slide 9: The Journey
        {
            id: 'the-journey',
            duration: 8000,
            background: {
                component: 'ScrollingCommits'
            },
            components: [
                {
                    component: 'Avatar',
                    props: { src: avatar, glow: true, size: 'md' },
                    position: { x: '50%', y: '15%' },
                    delay: 0
                },
                {
                    component: 'SlideTitle',
                    props: {
                        text: 'The Journey',
                        animation: 'fade',
                        duration: 3000
                    },
                    position: { x: '50%', y: '30%' },
                    delay: 0
                },
                {
                    component: 'TypewriterText',
                    props: {
                        text: 'Chaotic. Brilliant. Yours. In 2025 you debugged, built, broke things, and fixed them. Mostly.',
                        speed: 50,
                        cursor: true
                    },
                    position: { x: '50%', y: '50%' },
                    delay: 3000
                }
            ]
        },

        // Slide 10: The End
        {
            id: 'you-survived',
            duration: 10000,
            background: {
                component: 'ContributionGraph',
                props: { fillDuration: 10000 }
            },
            components: [
                {
                    component: 'Avatar',
                    props: { src: avatar, glow: true, size: 'lg' },
                    position: { x: '50%', y: '20%' },
                    delay: 0
                },
                {
                    component: 'SlideTitle',
                    props: {
                        text: 'You Survived 2025',
                        animation: 'fade',
                        duration: 3000
                    },
                    position: { x: '50%', y: '40%' },
                    delay: 0
                },
                {
                    component: 'TypewriterText',
                    props: {
                        text: `This was your year. ${contributions} contributions. ${repos} repositories. ${topLanguage} mastery. The terminal remembers.`,
                        speed: 50,
                        cursor: true
                    },
                    position: { x: '50%', y: '55%' },
                    delay: 3000
                }
            ]
        }
    ];
}
