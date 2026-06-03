/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Honey palette
        primary:        '#C98830',
        'primary-dark': '#A06820',
        income:         '#3D8A5A',
        expense:        '#BF5030',
        'bg-base':      '#F5EDDA',
        // Design tokens (CSS-variable-backed for inline use)
        honey:          '#C98830',
        'honey-ink':    '#7A5018',
        ink:            '#33200E',
        muted:          '#6B5038',
        faint:          '#9E7A55',
        surface:        '#FDFAF5',
        'surface-2':    '#EDE3CC',
        line:           '#DFD4BC',
        'line-soft':    '#E8DFC8',
      },
      fontFamily: {
        sans:  ['"Hanken Grotesk"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        serif: ['"Newsreader"', 'Georgia', 'serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.25rem',
        '4xl': '1.75rem',
      },
      boxShadow: {
        card: '0 2px 6px rgba(120,80,20,0.06), 0 12px 28px -16px rgba(150,100,30,0.32)',
        fab:  '0 8px 24px -6px rgba(201,136,48,0.50)',
        nav:  '0 -1px 0 rgba(120,80,20,0.06), 0 8px 32px -8px rgba(120,80,20,0.20)',
      },
    },
  },
  plugins: [],
}
