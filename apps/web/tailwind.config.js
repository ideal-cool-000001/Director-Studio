/** @type {import('tailwindcss').Config} */
import tokens from './design_tokens.json' assert { type: 'json' };

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: tokens.colors.primary,
        'on-primary': tokens.colors['on-primary'],
        secondary: tokens.colors.secondary,
        'on-secondary': tokens.colors['on-secondary'],
        tertiary: tokens.colors.tertiary,
        'on-tertiary': tokens.colors['on-tertiary'],
        background: tokens.colors.background,
        surface: tokens.colors.surface,
        'surface-elevated': tokens.colors['surface-elevated'],
        'on-surface': tokens.colors['on-surface'],
        'on-surface-variant': tokens.colors['on-surface-variant'],
        outline: tokens.colors.outline,
        'outline-variant': tokens.colors['outline-variant'],
        accent: tokens.colors.accent,
        success: tokens.colors.success,
        warning: tokens.colors.warning,
        error: tokens.colors.error,
        'purple-light': tokens.colors['purple-light'],
        'purple-accent': tokens.colors['purple-accent'],
        panel: tokens.colors.panel,
        card: tokens.colors.card,
        hover: tokens.colors.hover,
        muted: tokens.colors.muted,
        'text-primary': tokens.colors['text-primary'],
        'text-secondary': tokens.colors['text-secondary'],
        'text-muted': tokens.colors['text-muted'],
        canvas: {
          bg: '#1a1a2e',
          grid: '#16213e',
          node: '#0f3460',
          accent: '#e94560',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      fontSize: {
        'display-lg': [tokens.typography['display-lg'].fontSize, {
          fontWeight: tokens.typography['display-lg'].fontWeight,
          lineHeight: tokens.typography['display-lg'].lineHeight,
        }],
        'headline-lg': [tokens.typography['headline-lg'].fontSize, {
          fontWeight: tokens.typography['headline-lg'].fontWeight,
          lineHeight: tokens.typography['headline-lg'].lineHeight,
        }],
        'headline-md': [tokens.typography['headline-md'].fontSize, {
          fontWeight: tokens.typography['headline-md'].fontWeight,
          lineHeight: tokens.typography['headline-md'].lineHeight,
        }],
        'body-lg': [tokens.typography['body-lg'].fontSize, {
          fontWeight: tokens.typography['body-lg'].fontWeight,
          lineHeight: tokens.typography['body-lg'].lineHeight,
        }],
        'body-md': [tokens.typography['body-md'].fontSize, {
          fontWeight: tokens.typography['body-md'].fontWeight,
          lineHeight: tokens.typography['body-md'].lineHeight,
        }],
        'body-sm': [tokens.typography['body-sm'].fontSize, {
          fontWeight: tokens.typography['body-sm'].fontWeight,
          lineHeight: tokens.typography['body-sm'].lineHeight,
        }],
        'label-md': [tokens.typography['label-md'].fontSize, {
          fontWeight: tokens.typography['label-md'].fontWeight,
          lineHeight: tokens.typography['label-md'].lineHeight,
          letterSpacing: tokens.typography['label-md'].letterSpacing,
        }],
        'label-sm': [tokens.typography['label-sm'].fontSize, {
          fontWeight: tokens.typography['label-sm'].fontWeight,
          lineHeight: tokens.typography['label-sm'].lineHeight,
        }],
      },
      borderRadius: {
        sm: tokens.rounded.sm,
        md: tokens.rounded.md,
        lg: tokens.rounded.lg,
        xl: tokens.rounded.xl,
        full: tokens.rounded.full,
      },
      spacing: {
        unit: tokens.spacing.unit,
        xs: tokens.spacing.xs,
        sm: tokens.spacing.sm,
        md: tokens.spacing.md,
        lg: tokens.spacing.lg,
        xl: tokens.spacing.xl,
        xxl: tokens.spacing.xxl,
      },
      boxShadow: {
        'card': '0 4px 20px rgba(0,0,0,0.08)',
        'elevated': '0 8px 32px rgba(0,0,0,0.12)',
      },
    },
  },
  plugins: [],
};