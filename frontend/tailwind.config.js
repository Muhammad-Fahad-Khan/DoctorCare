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
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      transitionTimingFunction: {
        'docucare': 'cubic-bezier(0.16,1,0.3,1)',
      },
      boxShadow: {
        'glow-magenta': '0 0 25px rgba(158,53,167,0.4)',
        'glow-royal': '0 10px 40px rgba(78,23,93,0.10)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
