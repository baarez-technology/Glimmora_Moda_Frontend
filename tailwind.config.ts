import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Primary Palette - Foundation
        ivory: {
          cream: '#FAF8F5',
          warm: '#F5F1EA',
        },
        parchment: '#EDE8DF',
        sand: {
          light: '#E5DFD3',
          DEFAULT: '#D4CBBF',
        },
        taupe: '#B8AEA0',
        greige: '#9A8F82',
        stone: '#7A7068',
        charcoal: {
          warm: '#4A453D',
          deep: '#2D2A26',
        },
        noir: '#1A1816',

        // Accent Palette - Intelligence Signal
        gold: {
          soft: '#C9A962',
          muted: '#B89B4A',
          deep: '#9A7F35',
        },
        champagne: '#E8DCC4',
        bronze: {
          whisper: '#A8927A',
        },
        sapphire: {
          mist: '#4A5568',
          subtle: '#5C6B7A',
          deep: '#2C3E50',
        },
        azure: {
          whisper: '#E8ECF0',
        },

        // Semantic Palette
        success: {
          soft: '#6B8068',
          DEFAULT: '#4A6347',
        },
        warning: {
          soft: '#C4A35A',
          DEFAULT: '#A68B3D',
        },
        error: {
          soft: '#A67272',
          DEFAULT: '#8B5252',
        },
        info: {
          soft: '#6B7A8A',
          DEFAULT: '#4A5A6A',
        },
      },
      fontFamily: {
        display: ['Fraunces', 'Cormorant Garamond', 'Georgia', 'serif'],
        editorial: ['Cormorant Garamond', 'Georgia', 'serif'],
        body: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      boxShadow: {
        'sm': '0 1px 2px rgba(26, 24, 22, 0.04)',
        'md': '0 4px 12px rgba(26, 24, 22, 0.06)',
        'lg': '0 12px 32px rgba(26, 24, 22, 0.08)',
        'xl': '0 24px 64px rgba(26, 24, 22, 0.12)',
        'luxe': '0 1px 0 rgba(255,255,255,0.6) inset, 0 20px 50px -20px rgba(26,24,22,0.18), 0 4px 12px -4px rgba(26,24,22,0.06)',
        'glow-gold': '0 0 0 1px rgba(201,169,98,0.25), 0 20px 50px -20px rgba(201,169,98,0.45)',
        'glow-noir': '0 0 0 1px rgba(26,24,22,0.08), 0 30px 60px -30px rgba(26,24,22,0.55)',
        'card-lift': '0 1px 1px rgba(26,24,22,0.04), 0 10px 28px -16px rgba(26,24,22,0.18)',
      },
      backgroundImage: {
        'ivory-flow': 'linear-gradient(135deg, #FAF8F5 0%, #EDE8DF 100%)',
        'gold-whisper': 'linear-gradient(135deg, #E8DCC4 0%, #C9A962 100%)',
        'intelligence-depth': 'linear-gradient(180deg, #2C3E50 0%, #4A5568 100%)',
        'noir-editorial': 'linear-gradient(135deg, #1A1816 0%, #2D2A26 50%, #4A453D 100%)',
        'dawn-luxury': 'linear-gradient(135deg, #E8ECF0 0%, #FAF8F5 50%, #E8DCC4 100%)',
        'gold-aura': 'linear-gradient(180deg, rgba(201, 169, 98, 0.1) 0%, rgba(250, 248, 245, 0) 100%)',
        'mesh-luxe': 'radial-gradient(at 12% 8%, rgba(232,220,196,0.55) 0px, transparent 45%), radial-gradient(at 92% 18%, rgba(201,169,98,0.18) 0px, transparent 50%), radial-gradient(at 78% 92%, rgba(74,85,104,0.12) 0px, transparent 50%), linear-gradient(180deg, #FAF8F5 0%, #F5F1EA 100%)',
        'mesh-noir': 'radial-gradient(at 20% 0%, rgba(201,169,98,0.18) 0px, transparent 50%), radial-gradient(at 80% 100%, rgba(74,85,104,0.25) 0px, transparent 55%), linear-gradient(160deg, #1A1816 0%, #2D2A26 60%, #1A1816 100%)',
        'shine-gold': 'linear-gradient(110deg, transparent 0%, transparent 35%, rgba(255,255,255,0.55) 50%, transparent 65%, transparent 100%)',
        'hairline-gold': 'linear-gradient(90deg, transparent 0%, rgba(201,169,98,0.6) 35%, rgba(201,169,98,0.9) 50%, rgba(201,169,98,0.6) 65%, transparent 100%)',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.6s ease forwards',
        'fade-in': 'fadeIn 0.4s ease forwards',
        'slide-up': 'slideUp 0.5s ease forwards',
        'shine': 'shine 2.6s linear infinite',
        'pulse-gold': 'pulseGold 2.4s ease-in-out infinite',
        'float-slow': 'floatSlow 8s ease-in-out infinite',
      },
      keyframes: {
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(100%)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        shine: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseGold: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(201,169,98,0.55)' },
          '50%': { boxShadow: '0 0 0 12px rgba(201,169,98,0)' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
    },
  },
  plugins: [],
}
export default config
