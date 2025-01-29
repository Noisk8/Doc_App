/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      boxShadow: {
        'neon': '0 0 20px rgba(6, 182, 212, 0.3)',
        'neon-purple': '0 0 20px rgba(168, 85, 247, 0.3)',
        'neon-inset': 'inset 0 0 10px rgba(6, 182, 212, 0.2)',
        'neon-purple-inset': 'inset 0 0 10px rgba(168, 85, 247, 0.2)',
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(6, 182, 212, 0.3)' },
          '100%': { boxShadow: '0 0 30px rgba(168, 85, 247, 0.4)' },
        },
      },
    },
  },
  plugins: [],
};