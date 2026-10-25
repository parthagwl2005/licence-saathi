/** Colours come from CSS variables in src/index.css so light, dark and high-contrast modes can swap them. */
const v = (name) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: v('bg'),
        surface: v('surface'),
        sunk: v('sunk'),
        ink: v('ink'),
        muted: v('muted'),
        line: v('line'),
        brand: v('brand'),
        'brand-soft': v('brand-soft'),
        'on-brand': v('on-brand'),
        sun: v('sun'),
        ok: v('ok'),
        'ok-soft': v('ok-soft'),
        bad: v('bad'),
        'bad-soft': v('bad-soft'),
        warn: v('warn'),
        'warn-soft': v('warn-soft'),
        sage: v('t-sage'),
        sand: v('t-sand'),
        sky: v('t-sky'),
        blush: v('t-blush'),
        butter: v('t-butter'),
        lilac: v('t-lilac'),
      },
      fontFamily: {
        sans: ['"Hanken Grotesk"', '"Mukta"', 'system-ui', '-apple-system', '"Segoe UI"', 'Roboto', '"Noto Sans Devanagari"', 'sans-serif'],
        display: ['"Instrument Serif"', '"Mukta"', 'Georgia', '"Noto Serif Devanagari"', 'serif'],
      },
      borderRadius: { xl2: '1.25rem', '4xl': '2rem' },
      maxWidth: { app: '30rem' },
      boxShadow: {
        soft: '0 1px 2px rgb(var(--shadow) / 0.05), 0 10px 30px -14px rgb(var(--shadow) / 0.22)',
        lift: '0 2px 4px rgb(var(--shadow) / 0.06), 0 18px 40px -16px rgb(var(--shadow) / 0.3)',
      },
    },
  },
  plugins: [],
};
