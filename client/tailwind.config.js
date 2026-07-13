/** @type {import('tailwindcss').Config} */
// Design system for Shuraim Travel Agency.
// Trustworthy, professional look: single deep-blue brand, one gray family, SHARP 2px corners.
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  theme: {
    extend: {
      colors: {
        // Brand blue (actions, links)
        primary: {
          DEFAULT: '#0B5CFF',
          50: '#EAF1FF',
          100: '#D6E4FF',
          200: '#ADC8FF',
          300: '#7FA6FF',
          400: '#4D80FF',
          500: '#0B5CFF',
          600: '#0A4FDB',
          700: '#0A3D91',
          800: '#0A2E6B',
          900: '#0A2540',
        },
        // Deep navy for headings / sidebar
        ink: '#0A2540',
        // Teal accent (positive / highlights)
        accent: {
          DEFAULT: '#00B8A9',
          600: '#0E9E92',
        },
        success: '#16A34A',
        warning: '#D97706',
        danger: '#DC2626',
        // Single neutral family (replaces the #333/#666/mixed grays)
        neutral: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      fontSize: {
        xs: ['12px', '16px'],
        sm: ['14px', '20px'],
        base: ['16px', '24px'],
        lg: ['18px', '28px'],
        xl: ['24px', '32px'],
        '2xl': ['30px', '38px'],
        '3xl': ['36px', '44px'],
      },
      boxShadow: {
        // Only two levels — keep it clean
        card: '0 1px 2px 0 rgba(10, 37, 64, 0.06), 0 1px 3px 0 rgba(10, 37, 64, 0.08)',
        pop: '0 8px 24px -6px rgba(10, 37, 64, 0.18)',
      },
    },
    // SHARP corners: override the whole radius scale so nothing is pill-shaped by default.
    borderRadius: {
      none: '0px',
      sm: '2px',
      DEFAULT: '2px',
      md: '4px',
      lg: '4px',
      xl: '6px',
      full: '9999px', // reserved for avatars / dot badges only
    },
  },
  plugins: [],
};
