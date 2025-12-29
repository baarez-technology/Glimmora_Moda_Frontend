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
        display: ['Cormorant Garamond', 'Georgia', 'serif'],
        body: ['Outfit', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'sm': '0 1px 2px rgba(26, 24, 22, 0.04)',
        'md': '0 4px 12px rgba(26, 24, 22, 0.06)',
        'lg': '0 12px 32px rgba(26, 24, 22, 0.08)',
        'xl': '0 24px 64px rgba(26, 24, 22, 0.12)',
      },
      backgroundImage: {
        'ivory-flow': 'linear-gradient(135deg, #FAF8F5 0%, #EDE8DF 100%)',
        'gold-whisper': 'linear-gradient(135deg, #E8DCC4 0%, #C9A962 100%)',
        'intelligence-depth': 'linear-gradient(180deg, #2C3E50 0%, #4A5568 100%)',
        'noir-editorial': 'linear-gradient(135deg, #1A1816 0%, #2D2A26 50%, #4A453D 100%)',
        'dawn-luxury': 'linear-gradient(135deg, #E8ECF0 0%, #FAF8F5 50%, #E8DCC4 100%)',
        'gold-aura': 'linear-gradient(180deg, rgba(201, 169, 98, 0.1) 0%, rgba(250, 248, 245, 0) 100%)',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.6s ease forwards',
        'fade-in': 'fadeIn 0.4s ease forwards',
        'slide-up': 'slideUp 0.5s ease forwards',
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
      },
    },
  },
  plugins: [],
}
export default config
