import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#9a040a',
          gold: '#f8bf50',
          accent: '#dd4c0c',
          dark: '#130608',
          muted: '#f8f4f2',
        },
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(248,191,80,0.18), 0 12px 40px rgba(154,4,10,0.18)',
      },
      backgroundImage: {
        'hero-grid':
          'radial-gradient(circle at top right, rgba(248,191,80,0.16), transparent 32%), radial-gradient(circle at left center, rgba(221,76,12,0.16), transparent 26%), linear-gradient(135deg, rgba(19,6,8,0.98), rgba(34,8,12,0.95))',
      },
    },
  },
  plugins: [],
} satisfies Config;
