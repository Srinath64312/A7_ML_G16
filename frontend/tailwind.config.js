/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#07090e',
          light: '#f8fafc',
        },
        surface: {
          dark: '#0d121e',
          light: '#ffffff',
        },
        card: {
          DEFAULT: 'rgba(13, 18, 30, 0.85)',
          light: 'rgba(255, 255, 255, 0.9)',
        },
        borderGlow: 'rgba(99, 102, 241, 0.15)',
        primary: {
          DEFAULT: '#6366f1',
          glow: 'rgba(99, 102, 241, 0.4)'
        },
        secondary: {
          DEFAULT: '#06b6d4',
          glow: 'rgba(6, 182, 212, 0.4)'
        },
        success: {
          DEFAULT: '#10b981',
          glow: 'rgba(16, 185, 129, 0.3)'
        },
        warning: {
          DEFAULT: '#f59e0b',
          glow: 'rgba(245, 158, 11, 0.3)'
        },
        danger: {
          DEFAULT: '#f43f5e',
          glow: 'rgba(244, 63, 94, 0.3)'
        }
      },
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
    },
  },
  plugins: [],
}
