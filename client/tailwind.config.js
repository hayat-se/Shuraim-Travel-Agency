/** @type {import('tailwindcss').Config} */
// Design system for Shuraim Air Travel & Tours.
// Premium travel-tech brand: deep forest green primary, emerald/mint accent,
// warm sand neutrals, gold highlight, soft rounded geometry, glass + gradient surfaces.
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  theme: {
    extend: {
      colors: {
        // Brand green (actions, links, active nav) — DEFAULT is the brand mark #106043
        primary: {
          DEFAULT: '#106043',
          50: '#EFFBF6',
          100: '#D7F4E9',
          200: '#B0E8D3',
          300: '#7BD5B4',
          400: '#34C18D',
          500: '#106043',
          600: '#0C5037',
          700: '#093F2B',
          800: '#063222',
          900: '#04301F',
          950: '#021C12',
        },

        // Deep forest — sidebar, headings, overlays
        forest: {
          DEFAULT: '#04301F',
          700: '#06452D',
          800: '#053825',
          900: '#022114',
        },

        // Mint accent — highlights, positive deltas, glow
        mint: {
          DEFAULT: '#34D498',
          50: '#EAFBF3',
          100: '#CFF6E4',
          200: '#A2EDCB',
          300: '#67E1AC',
          400: '#34D498',
          500: '#34D498',
          600: '#1FB57D',
          700: '#178F63',
        },

        // Text/heading ink — forest-tinted, never pure black
        ink: {
          DEFAULT: '#04301F',
          700: '#0C4A32',
          800: '#083826',
          900: '#021A11',
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

        // Single neutral family, very slightly green-tinted so grays sit with the brand
        neutral: {
          50: '#F7FAF8',
          100: '#EFF4F1',
          200: '#E1E9E5',
          300: '#C7D4CD',
          400: '#94A79D',
          500: '#6B7F76',
          600: '#4F615A',
          700: '#3A4A44',
          800: '#26332E',
          900: '#16211C',
          950: '#0C1310',
        },

        // Warm sand neutral — used for light section backgrounds/text on the
        // marketing pages so they don't inherit the cool green-gray tint above.
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

        // Gold/champagne — a second accent so the palette isn't mint-on-everything.
        // Used sparingly: ratings, dividers, premium badges, a warm CTA option.
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

      letterSpacing: {
        tightish: '-0.011em',
      },

      // Gradients used across buttons, cards, headers and chips
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #147953 0%, #106043 52%, #0A4630 100%)',
        'gradient-brand-hover': 'linear-gradient(135deg, #178C60 0%, #12694A 52%, #0C5037 100%)',
        'gradient-forest': 'linear-gradient(160deg, #06452D 0%, #04301F 60%, #022114 100%)',
        'gradient-mint': 'linear-gradient(135deg, #4FE0A8 0%, #34D498 55%, #1FB57D 100%)',
        'gradient-gold': 'linear-gradient(135deg, #EAD08C 0%, #C9A24B 55%, #AD873A 100%)',
        // Soft surface washes
        'gradient-surface': 'linear-gradient(180deg, #FFFFFF 0%, #F4FBF7 100%)',
        'gradient-header': 'linear-gradient(180deg, #F2FAF6 0%, #EAF6F0 100%)',
        'gradient-chip': 'linear-gradient(135deg, #E4F6EC 0%, #CFF0E0 100%)',
        // Warm marketing-page surfaces — replace flat white/gray with life
        'gradient-sand': 'linear-gradient(180deg, #FEFCF9 0%, #FBF7F0 55%, #F5EEE1 100%)',
        'gradient-dusk': 'linear-gradient(160deg, #093F2B 0%, #052A1C 55%, #02150D 100%)',
        'gradient-hero-glow':
          'radial-gradient(1100px 620px at 82% -8%, rgba(52,212,152,0.20), transparent 60%), radial-gradient(760px 520px at -8% 18%, rgba(201,162,75,0.14), transparent 55%), linear-gradient(165deg, #06452D 0%, #04301F 55%, #021A11 100%)',
        // Glass + sheen
        'gradient-glass': 'linear-gradient(135deg, rgba(255,255,255,0.85) 0%, rgba(244,251,247,0.65) 100%)',
        'gradient-glass-dark': 'linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.03) 100%)',
        'gradient-sheen': 'linear-gradient(100deg, rgba(255,255,255,0) 20%, rgba(255,255,255,0.28) 50%, rgba(255,255,255,0) 80%)',
        'gradient-hairline': 'linear-gradient(90deg, rgba(52,212,152,0) 0%, rgba(52,212,152,0.9) 50%, rgba(52,212,152,0) 100%)',
        'gradient-hairline-gold': 'linear-gradient(90deg, rgba(201,162,75,0) 0%, rgba(201,162,75,0.85) 50%, rgba(201,162,75,0) 100%)',
      },

      boxShadow: {
        // Quiet, layered, forest-tinted — never black
        card: '0 1px 2px 0 rgba(4, 48, 31, 0.05), 0 1px 3px 0 rgba(4, 48, 31, 0.07)',
        'card-hover': '0 6px 16px -6px rgba(4, 48, 31, 0.16), 0 2px 6px -2px rgba(4, 48, 31, 0.08)',
        pop: '0 18px 40px -12px rgba(4, 48, 31, 0.28), 0 4px 12px -4px rgba(4, 48, 31, 0.12)',
        premium: '0 24px 60px -16px rgba(4, 48, 31, 0.32), 0 8px 24px -8px rgba(4, 48, 31, 0.14)',
        glow: '0 8px 20px -8px rgba(16, 96, 67, 0.55)',
        'glow-mint': '0 8px 22px -8px rgba(52, 212, 152, 0.55)',
        'glow-gold': '0 8px 24px -8px rgba(201, 162, 75, 0.5)',
        'inner-soft': 'inset 0 1px 2px 0 rgba(4, 48, 31, 0.06)',
        'row-active': 'inset 3px 0 0 0 #106043',
        header: '0 1px 0 0 rgba(4, 48, 31, 0.06)',
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
      },

      animation: {
        'fade-in': 'fade-in 0.25s ease-out both',
        'fade-in-up': 'fade-in-up 0.35s cubic-bezier(0.16, 1, 0.3, 1) both',
        'scale-in': 'scale-in 0.2s cubic-bezier(0.16, 1, 0.3, 1) both',
        shimmer: 'shimmer 1.8s ease-in-out infinite',
      },

      transitionTimingFunction: {
        premium: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },

    // Soft, premium radius scale — replaces the old all-sharp 2px system.
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
