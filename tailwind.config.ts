import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      // Mobile-first breakpoints
      screens: {
        xs: '375px',
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
      },
      // Touch-friendly spacing (Requirements 12.2, 21.2)
      spacing: {
        touch: '44px', // Minimum touch target size (44x44px)
        'touch-sm': '40px', // Small touch target
        'touch-lg': '48px', // Large touch target
        'touch-xl': '56px', // Extra large touch target
      },
      // Minimum sizes for touch targets
      minHeight: {
        touch: '44px',
        'touch-sm': '40px',
        'touch-lg': '48px',
        'touch-xl': '56px',
      },
      minWidth: {
        touch: '44px',
        'touch-sm': '40px',
        'touch-lg': '48px',
        'touch-xl': '56px',
      },
      // Font sizes optimized for mobile readability
      fontSize: {
        'mobile-xs': ['0.75rem', { lineHeight: '1rem' }],
        'mobile-sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'mobile-base': ['1rem', { lineHeight: '1.5rem' }],
        'mobile-lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'mobile-xl': ['1.25rem', { lineHeight: '1.75rem' }],
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    // Custom plugin for touch-target utilities
    function ({ addUtilities }: any) {
      const newUtilities = {
        '.touch-target': {
          minWidth: '44px',
          minHeight: '44px',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
        },
        '.touch-target-sm': {
          minWidth: '40px',
          minHeight: '40px',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
        },
        '.touch-target-lg': {
          minWidth: '48px',
          minHeight: '48px',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
        },
        '.touch-target-xl': {
          minWidth: '56px',
          minHeight: '56px',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
        },
        // Prevent text selection on touch (for buttons)
        '.touch-no-select': {
          '-webkit-user-select': 'none',
          '-moz-user-select': 'none',
          '-ms-user-select': 'none',
          'user-select': 'none',
          '-webkit-tap-highlight-color': 'transparent',
        },
        // Active state for touch feedback
        '.touch-active': {
          '@apply active:scale-95 active:opacity-80 transition-transform': {},
        },
      };
      addUtilities(newUtilities);
    },
  ],
};

export default config;
