export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: { extend: {
    colors: { ink: '#1F3A32', deep: '#16291F', paper: '#F2F3EE', seal: '#7A1F2B', brass: '#B08D57', sage: '#8FA58C' },
    fontFamily: { serif: ['Fraunces', 'serif'], sans: ['Figtree', 'sans-serif'], script: ['"Pinyon Script"', 'cursive'] },
    keyframes: {
      pulseRing: { '50%': { boxShadow: '0 0 0 12px #B08D5733' } },
      fall: { '0%': { transform: 'translate3d(0,-10vh,0) rotate(0deg)' }, '100%': { transform: 'translate3d(var(--dx),110vh,0) rotate(540deg)' } },
    },
    animation: { 'pulse-ring': 'pulseRing 2.4s infinite', fall: 'fall 12s linear infinite' },
  } },
};
