/** @type {import('tailwindcss').Config} */
// Design system for Shuraim Air Travel & Tours.
// Green + white brand (from the approved Stitch design), sharp 2px corners.
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  theme: {
    extend: {
      colors: {
        // Brand green — `primary` drives buttons, links and active states.
        primary: {
          DEFAULT: '#106043', // mid green
          50: '#E8F5EE',
          100: '#C0EDD3',
          200: '#A5D0B7',
          300: '#8DD6B1',
          400: '#34D498', // bright mint
          500: '#106043',
          600: '#0C4A33',
          700: '#0A3D2A',
          800: '#073322',
          900: '#04301F',
        },
        // Deep forest green — sidebar, hero, footers.
        ink: '#04301F',
        'ink-deep': '#00190E',
        // Mint accent — highlights, success fills, chart areas, active indicators.
        accent: {
          DEFAULT: '#34D498',
          light: '#67FCBD',
          dim: '#44DFA2',
        },
        success: '#16A34A',
        warning: '#D97706',
        danger: '#BA1A1A',
        // Green-tinted neutral family (matches the design's surface tokens).
        neutral: {
          50: '#F7FAF8',
          100: '#F1F4F2',
          200: '#E0E3E1',
          300: '#C1C8C2',
          400: '#A0A8A3',
          500: '#717973',
          600: '#5A625C',
          700: '#414943',
          800: '#2D3130',
          900: '#181C1C',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      fontSize: {
        xs: ['12px', { lineHeight: '16px', letterSpacing: '0.01em' }],
        sm: ['14px', '20px'],
        base: ['16px', '24px'],
        lg: ['18px', '28px'],
        xl: ['24px', { lineHeight: '32px', letterSpacing: '-0.01em' }],
        '2xl': ['30px', { lineHeight: '40px', letterSpacing: '-0.02em' }],
        '3xl': ['40px', { lineHeight: '48px', letterSpacing: '-0.02em' }],
        '4xl': ['52px', { lineHeight: '58px', letterSpacing: '-0.03em' }],
      },
      boxShadow: {
        card: '0 1px 2px 0 rgba(4, 48, 31, 0.06), 0 1px 3px 0 rgba(4, 48, 31, 0.08)',
        lift: '0 8px 20px -6px rgba(4, 48, 31, 0.14)',
        pop: '0 12px 32px -8px rgba(4, 48, 31, 0.22)',
      },
      keyframes: {
        slideUpFade: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        floatSlow: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      animation: {
        enter: 'slideUpFade 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        float: 'floatSlow 6s ease-in-out infinite',
      },
    },
    // Sharp corners everywhere (kept from the approved design).
    borderRadius: {
      none: '0px',
      sm: '2px',
      DEFAULT: '2px',
      md: '4px',
      lg: '4px',
      xl: '6px',
      full: '9999px', // avatars / dot badges only
    },
  },
  plugins: [],
};
