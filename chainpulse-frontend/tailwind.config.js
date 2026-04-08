/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dark-bg': '#0a0f1e',
        'dark-card': '#111827',
        'dark-text': '#f9fafb',
        'dark-muted': '#6b7280',
        'accent-blue': '#3b82f6',
        'accent-green': '#10b981',
        'accent-amber': '#f59e0b',
        'accent-red': '#ef4444',
      }
    },
  },
  plugins: [],
}
