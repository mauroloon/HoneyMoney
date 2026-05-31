/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary:   '#00C57A',
        'primary-dark': '#00916E',
        income:    '#34C759',
        expense:   '#FF3B30',
        'bg-base': '#F2F2F7',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'Segoe UI', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.25rem',
      },
      boxShadow: {
        card: '0 2px 12px rgba(0,0,0,0.06)',
        fab:  '0 6px 20px rgba(0,197,122,0.45)',
      },
    },
  },
  plugins: [],
}
