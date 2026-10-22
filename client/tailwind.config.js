/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        skribbl: {
          bg: '#0f172a',
          board: '#ffffff',
          panel: '#1e293b',
          border: '#334155',
          primary: '#3b82f6',
          accent: '#10b981',
          danger: '#ef4444',
          gold: '#f59e0b'
        }
      },
      fontFamily: {
        sans: ['Nunito', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Fredoka', 'Nunito', 'sans-serif']
      }
    },
  },
  plugins: [],
}
