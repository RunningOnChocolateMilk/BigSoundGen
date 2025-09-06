module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        synth: {
          primary: '#6366f1',
          secondary: '#8b5cf6',
          accent: '#f59e0b',
          dark: '#1f2937',
          darker: '#111827'
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'monospace']
      }
    },
  },
  plugins: [],
}
