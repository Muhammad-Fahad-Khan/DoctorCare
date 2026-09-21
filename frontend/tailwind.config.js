/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        orchid: '#F1BCE4', // light accent — glows, badge highlights, hover tints
        wisteria: '#B87AB6', // secondary — secondary buttons, icons, progress
        magenta: '#9E35A7', // primary brand — CTAs, active states, focus rings
        royal: '#4E175D', // deep surface & text — headers, dark cards
        surface: '#FBF8FD', // page background — a whisper of lilac instead of flat white
        mint: '#2FB98A', // success / "verified" accents
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      transitionTimingFunction: {
        docucare: 'cubic-bezier(0.16,1,0.3,1)',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #B24BBB 0%, #9E35A7 45%, #6B2380 100%)',
        'brand-soft': 'linear-gradient(135deg, rgba(241,188,228,0.45) 0%, rgba(184,122,182,0.18) 100%)',
        'dark-gradient': 'linear-gradient(135deg, #4E175D 0%, #2E0D38 100%)',
      },
      boxShadow: {
        'glow-magenta': '0 8px 30px rgba(158,53,167,0.35)',
        'glow-royal': '0 10px 40px rgba(78,23,93,0.10)',
        soft: '0 1px 2px rgba(78,23,93,0.04), 0 8px 24px -10px rgba(78,23,93,0.12)',
        lift: '0 2px 4px rgba(78,23,93,0.04), 0 24px 48px -16px rgba(78,23,93,0.22)',
      },
      backdropBlur: {
        xs: '2px',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        blob: {
          '0%, 100%': { transform: 'translate(0,0) scale(1)' },
          '50%': { transform: 'translate(20px,-24px) scale(1.08)' },
        },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'float-slow': 'float 8s ease-in-out infinite',
        // `backwards` (not `both`): once finished the element keeps no transform, so it can't trap fixed-position children.
        'fade-up': 'fade-up 0.6s cubic-bezier(0.16,1,0.3,1) backwards',
        blob: 'blob 12s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
