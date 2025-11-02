import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        rudi: {
          teal: '#009688',
          yellow: '#FFB300',
          coral: '#FF6F61',
          sand: '#FDF6EC',
          maroon: '#3B1F1E',
        },
      },
      borderRadius: {
        rudi: '16px',
        'rudi-card': '24px',
      },
      fontFamily: {
        heading: ['Poppins', 'ui-sans-serif', 'system-ui'],
        body: ['Nunito Sans', 'system-ui'],
      },
      boxShadow: {
        'rudi-card': '0 8px 24px rgba(0, 0, 0, 0.06)',
      },
      transitionDuration: {
        rudi: '180ms',
      },
    },
  },
  plugins: [],
};

export default config;
