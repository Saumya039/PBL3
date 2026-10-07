export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#020617',
        primary: '#0F172A',
        secondary: '#1E293B',
        accent: '#22C55E',
        textPrimary: '#F8FAFC',
        textMuted: '#94A3B8',
        critical: '#EF4444',
        warning: '#F97316',
        medium: '#EAB308',
        low: '#3B82F6',
        info: '#6B7280',
      },
      fontFamily: {
        sans: ['Fira Sans', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
      boxShadow: {
        'neon': '0 0 15px rgba(34,197,94,0.3)',
      }
    },
  },
  plugins: [],
}
