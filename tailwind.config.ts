import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#F4A8B8',
        'primary-soft': '#FBD9DF',
        accent: '#DC4848',
        cream: '#F2DCB6',
        twine: '#C9A876',
        'text-dark': '#1F1F2E',
        'bg-soft': '#FFFAF7',
      },
      fontFamily: {
        sans: ['var(--font-heebo)', 'Heebo', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'var(--font-heebo)', 'Heebo', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
