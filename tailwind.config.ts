import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],

  theme: {
    extend: {
      colors: {
        champagne: {
          DEFAULT: '#F5EBDD',
          soft: '#F2E7D8',
        },

        marsala: {
          DEFAULT: '#651C32',
          dark: '#4A1222',
          medium: '#7A2940',
          soft: '#8E4055',
        },

        gold: '#C8A15A',

        ink: '#2E2E2E',
      },

      fontFamily: {
        display: ['var(--font-cormorant)', 'serif'],
        heading: ['var(--font-playfair)', 'serif'],
        label: ['var(--font-cinzel)', 'serif'],
        body: ['var(--font-montserrat)', 'sans-serif'],
      },

      letterSpacing: {
        widest2: '0.28em',
      },
    },
  },

  plugins: [],
};

export default config;
