/** Auspify design tokens. Surfaces/ink are CSS variables so the dark/light toggle re-themes every utility. */
const v = (n) => `rgb(var(--${n}) / <alpha-value>)`
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        onyx: v('bg'),          // #0E1015 (dark)
        graphite: v('surface'), // #23262F (dark)
        graphite2: v('surface2'), // #1A1D24
        hover: v('hover'),      // #2D323E
        ink: v('ink'),
        mute: v('muted'),
        accent: v('accent'),    // lime text (darkened in light mode for contrast)
        spark: '#B6FF2E',
        emerald: '#10B981',
        crimson: '#EF4444',
        amber: '#F59E0B',
        line: 'rgb(var(--line) / 0.08)',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      keyframes: {
        float: { '0%,100%': { transform: 'translate(0,0) scale(1)' }, '50%': { transform: 'translate(30px,-24px) scale(1.12)' } },
        draw: { to: { strokeDashoffset: 0 } },
        slideIn: { from: { transform: 'translateX(100%)' }, to: { transform: 'translateX(0)' } },
        pop: { from: { opacity: 0, transform: 'scale(.96)' }, to: { opacity: 1, transform: 'scale(1)' } },
        toast: { from: { opacity: 0, transform: 'translateY(12px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
      },
      animation: {
        float: 'float 14s ease-in-out infinite',
        floatSlow: 'float 22s ease-in-out infinite reverse',
        draw: 'draw 2.4s ease-out forwards',
        slideIn: 'slideIn .25s ease-out',
        pop: 'pop .18s ease-out',
        toast: 'toast .25s ease-out',
      },
    },
  },
  plugins: [],
}
