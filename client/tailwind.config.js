/** @type {import('tailwindcss').Config} */
// Design system for Shuraim Air Travel & Tours.
// Sky-blue brand: azure primary, deep navy ink, sky-cyan accent — tuned to sit on
// a sky + clouds hero. Token NAMES are unchanged so the whole app re-themes at once.
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  theme: {
    extend: {
      colors: {
        // Brand azure (actions, links, active nav) — DEFAULT is the brand mark
        primary: {
          DEFAULT: '#2680EB',
          50: '#EAF3FE',
          100: '#D3E6FD',
          200: '#A9CEFB',
          300: '#79B0F7',
          400: '#4A92F1',
          500: '#2680EB',
          600: '#1A66C7',
          700: '#154F9C',
          800: '#123F79',
          900: '#0F2E56',
          950: '#0A1F3D',
        },

        // Deep navy — sidebar, headings, overlays, dark sections
        forest: {
          DEFAULT: '#0B2447',
          700: '#12325E',
          800: '#0D2749',
          900: '#071A36',
        },

        // Sky-cyan accent — highlights, positive deltas, glow (matches sky & clouds)
        mint: {
          DEFAULT: '#38BDF8',
          50: '#EAF7FF',
          100: '#D3EEFE',
          200: '#A6DDFC',
          300: '#6FC8FA',
          400: '#38BDF8',
          500: '#38BDF8',
          600: '#1C9FE0',
          700: '#167DB5',
        },

        // Text/heading ink — deep navy, never pure black
        ink: {
          DEFAULT: '#0B2447',
          700: '#14335E',
          800: '#0E2749',
          900: '#071A36',
        },

        success: {
          DEFAULT: '#16A34A',
          50: '#F0FDF4',
          600: '#15803D',
          700: '#166534',
        },
        warning: {
          DEFAULT: '#D97706',
          50: '#FFFBEB',
          600: '#B45309',
          700: '#92400E',
        },
        danger: {
          DEFAULT: '#DC2626',
          50: '#FEF2F2',
          600: '#B91C1C',
          700: '#991B1B',
        },

        // Single neutral family — cool blue-slate so grays sit with the brand
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
          950: '#080F1D',
        },

        // Warm sand — retained for any legacy references (unused in the blue theme)
        sand: {
          25: '#FEFCF9',
          50: '#FBF7F0',
          100: '#F5EEE1',
          200: '#EAE0CC',
          300: '#D8C9AC',
          400: '#B9A67F',
          500: '#96835C',
          600: '#786B4A',
          700: '#584E37',
          800: '#3A3325',
          900: '#241F17',
        },

        // Secondary accent — retained for legacy references (unused in the blue theme)
        gold: {
          DEFAULT: '#C9A24B',
          50: '#FBF4E3',
          100: '#F5E6C1',
          200: '#EAD08C',
          300: '#DDB763',
          400: '#C9A24B',
          500: '#AD873A',
          600: '#8C6D2E',
          700: '#6B5222',
        },
      },

      fontFamily: {
        // Body: Manrope. Headings/display: Sora (premium geometric).
        sans: ['Manrope', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Sora', 'Manrope', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
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

      letterSpacing: {
        tightish: '-0.011em',
      },

      // Gradients used across buttons, cards, headers and chips (blue theme)
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #3A8FF0 0%, #2680EB 52%, #1A66C7 100%)',
        'gradient-brand-hover': 'linear-gradient(135deg, #4A9BF5 0%, #2E86EE 52%, #1F72D6 100%)',
        'gradient-forest': 'linear-gradient(160deg, #12325E 0%, #0B2447 60%, #071A36 100%)',
        'gradient-mint': 'linear-gradient(135deg, #6FD0FB 0%, #38BDF8 55%, #1C9FE0 100%)',
        'gradient-gold': 'linear-gradient(135deg, #EAD08C 0%, #C9A24B 55%, #AD873A 100%)',
        // Soft surface washes
        'gradient-surface': 'linear-gradient(180deg, #FFFFFF 0%, #F3F8FF 100%)',
        'gradient-header': 'linear-gradient(180deg, #F2F8FF 0%, #E8F2FE 100%)',
        'gradient-chip': 'linear-gradient(135deg, #E6F2FE 0%, #D0E6FD 100%)',
        // Marketing-page surfaces
        'gradient-sand': 'linear-gradient(180deg, #FBFDFF 0%, #F3F8FF 55%, #E9F2FE 100%)',
        'gradient-dusk': 'linear-gradient(160deg, #12325E 0%, #0B2447 55%, #071A36 100%)',
        'gradient-hero-glow':
          'radial-gradient(1100px 620px at 82% -8%, rgba(56,189,248,0.22), transparent 60%), radial-gradient(760px 520px at -8% 18%, rgba(38,128,235,0.16), transparent 55%), linear-gradient(165deg, #12325E 0%, #0B2447 55%, #071A36 100%)',
        // Glass + sheen
        'gradient-glass': 'linear-gradient(135deg, rgba(255,255,255,0.85) 0%, rgba(243,248,255,0.65) 100%)',
        'gradient-glass-dark': 'linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.03) 100%)',
        'gradient-sheen': 'linear-gradient(100deg, rgba(255,255,255,0) 20%, rgba(255,255,255,0.28) 50%, rgba(255,255,255,0) 80%)',
        'gradient-hairline': 'linear-gradient(90deg, rgba(56,189,248,0) 0%, rgba(56,189,248,0.9) 50%, rgba(56,189,248,0) 100%)',
        'gradient-hairline-gold': 'linear-gradient(90deg, rgba(201,162,75,0) 0%, rgba(201,162,75,0.85) 50%, rgba(201,162,75,0) 100%)',
      },

      boxShadow: {
        // Quiet, layered, navy-tinted — never black
        card: '0 1px 2px 0 rgba(11, 36, 71, 0.05), 0 1px 3px 0 rgba(11, 36, 71, 0.07)',
        'card-hover': '0 6px 16px -6px rgba(11, 36, 71, 0.16), 0 2px 6px -2px rgba(11, 36, 71, 0.08)',
        pop: '0 18px 40px -12px rgba(11, 36, 71, 0.28), 0 4px 12px -4px rgba(11, 36, 71, 0.12)',
        premium: '0 24px 60px -16px rgba(11, 36, 71, 0.32), 0 8px 24px -8px rgba(11, 36, 71, 0.14)',
        glow: '0 8px 20px -8px rgba(38, 128, 235, 0.55)',
        'glow-mint': '0 8px 22px -8px rgba(56, 189, 248, 0.55)',
        'glow-gold': '0 8px 24px -8px rgba(201, 162, 75, 0.5)',
        'inner-soft': 'inset 0 1px 2px 0 rgba(11, 36, 71, 0.06)',
        'row-active': 'inset 3px 0 0 0 #2680EB',
        header: '0 1px 0 0 rgba(11, 36, 71, 0.06)',
      },

      backdropBlur: {
        xs: '2px',
      },

      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'translateY(8px) scale(0.98)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        // Marquee: content enters from the left, exits to the right (rightward drift)
        marquee: {
          '0%': { transform: 'translateX(-50%)' },
          '100%': { transform: 'translateX(0)' },
        },
        // Auth brand panel: slow horizontal cloud drift + gentle plane bob
        'cloud-drift': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(48px)' },
        },
        'plane-float': {
          '0%, 100%': { transform: 'translateY(0) rotate(-4deg)' },
          '50%': { transform: 'translateY(-12px) rotate(-4deg)' },
        },
      },

      animation: {
        'fade-in': 'fade-in 0.25s ease-out both',
        'fade-in-up': 'fade-in-up 0.35s cubic-bezier(0.16, 1, 0.3, 1) both',
        'scale-in': 'scale-in 0.2s cubic-bezier(0.16, 1, 0.3, 1) both',
        shimmer: 'shimmer 1.8s ease-in-out infinite',
        marquee: 'marquee 32s linear infinite',
        'cloud-drift': 'cloud-drift 20s ease-in-out infinite alternate',
        'cloud-drift-slow': 'cloud-drift 30s ease-in-out infinite alternate',
        'plane-float': 'plane-float 7s ease-in-out infinite',
      },

      transitionTimingFunction: {
        premium: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },

    // Soft, premium radius scale.
    borderRadius: {
      none: '0px',
      sm: '6px',
      DEFAULT: '8px',
      md: '10px',
      lg: '14px',
      xl: '20px',
      '2xl': '28px',
      full: '9999px',
    },
  },
  plugins: [],
};
