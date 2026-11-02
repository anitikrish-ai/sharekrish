import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        glass: {
          bg: 'rgba(255,255,255,0.06)',
          border: 'rgba(255,255,255,0.14)',
          highlight: 'rgba(255,255,255,0.35)',
        },
        // Apple design-system tokens — single blue accent, near-black tile surfaces.
        action: '#0066cc',
        'action-focus': '#0071e3',
        'action-on-dark': '#2997ff',
        ink: '#1d1d1f',
        'ink-muted-80': '#333333',
        'ink-muted-48': '#7a7a7a',
        'tile-1': '#272729',
        'tile-2': '#2a2a2c',
        'tile-3': '#252527',
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        glass: '0 8px 32px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.12)',
        product: '3px 5px 30px rgba(0,0,0,0.22)',
      },
      borderRadius: {
        squircle: '28px',
        sm: '8px',
        md: '11px',
        lg: '18px',
        pill: '9999px',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      keyframes: {
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'fade-up': { from: { opacity: '0', transform: 'translateY(10px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        'scale-pop': { '0%': { transform: 'scale(0.94)', opacity: '0' }, '70%': { transform: 'scale(1.02)' }, '100%': { transform: 'scale(1)', opacity: '1' } },
        'sheet-up': { from: { transform: 'translateY(100%)', opacity: '0' }, to: { transform: 'translateY(0)', opacity: '1' } },
      },
      animation: {
        'fade-in': 'fade-in 150ms cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-up': 'fade-up 220ms cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-pop': 'scale-pop 200ms cubic-bezier(0.16, 1, 0.3, 1)',
        'sheet-up': 'sheet-up 260ms cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
}

export default config
