/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Noto Serif KR"', 'serif'],
        body: ['"Noto Sans KR"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        sand:   { DEFAULT: '#f0ebe1', 50: '#faf8f4', 100: '#f0ebe1', 200: '#e0d6c6' },
        ink:    { DEFAULT: '#1c1917', light: '#44403c', muted: '#78716c' },
        coral:  { DEFAULT: '#e05a3a', light: '#f07a5a', dark: '#c04a2a' },
        teal:   { DEFAULT: '#2a7c74', light: '#3a9c94', dark: '#1a5c54' },
        stone:  { DEFAULT: '#d4cfc5', light: '#e8e3d9' },
      },
      animation: {
        'slide-up':   'slideUp 0.45s cubic-bezier(0.22,1,0.36,1) both',
        'fade-in':    'fadeIn 0.3s ease both',
        'pop':        'pop 0.2s ease both',
      },
      keyframes: {
        slideUp:  { from: { opacity: '0', transform: 'translateY(20px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        fadeIn:   { from: { opacity: '0' }, to: { opacity: '1' } },
        pop:      { '0%': { transform: 'scale(0.92)' }, '60%': { transform: 'scale(1.04)' }, '100%': { transform: 'scale(1)' } },
      },
    },
  },
  plugins: [],
}
