import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{ts,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eefbf3',
          100: '#d8f5e2',
          200: '#b5eac7',
          300: '#83d9a2',
          400: '#4fc17a',
          500: '#25a85c',
          600: '#188847',
          700: '#166c3b',
          800: '#155631',
          900: '#13472a'
        }
      },
      boxShadow: {
        soft: '0 12px 30px rgba(15, 23, 42, 0.08)'
      },
      borderRadius: {
        '2xl': '1.25rem'
      }
    }
  },
  plugins: []
} satisfies Config;
