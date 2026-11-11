/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#4b7a2d',
          DEFAULT: '#2D5016',
          dark: '#1a320d',
        },
        secondary: {
          light: '#a4d468',
          DEFAULT: '#8BC34A',
          dark: '#689f38',
        },
        accent: {
          light: '#ffb74d',
          DEFAULT: '#FF9800',
          dark: '#f57c00',
        },
        earth: {
          50: '#faf8f5',
          100: '#f5f0e6',
          200: '#e6d8c1',
          300: '#d7c09c',
          400: '#c8a877',
          500: '#b99052',
          600: '#9e733b',
          700: '#7a552e',
          800: '#573d22',
          900: '#352516',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      backgroundImage: {
        'hero-pattern': "linear-gradient(rgba(45, 80, 22, 0.6), rgba(45, 80, 22, 0.85)), url('https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=2070&auto=format&fit=crop')",
        'newsletter-pattern': "linear-gradient(rgba(26, 50, 13, 0.9), rgba(26, 50, 13, 0.95)), url('https://images.unsplash.com/photo-1464226184884-fa280b87c399?q=80&w=2070&auto=format&fit=crop')",
      }
    },
  },
  plugins: [],
}
