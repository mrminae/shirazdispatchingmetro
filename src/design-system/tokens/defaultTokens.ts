/**
 * Default Design Tokens for Shiraz Metro Design System & OCC Operations
 */

import { DesignTokens } from '../types/schema';

export const DEFAULT_DESIGN_TOKENS: DesignTokens = {
  colors: {
    primary: '#10b981', // Emerald OCC
    primaryHover: '#059669',
    primaryActive: '#047857',
    secondary: '#0ea5e9', // Sky Blue
    accent: '#10b981',
    accentGlow: 'rgba(16, 185, 129, 0.25)',
    background: '#020617', // Deep slate 950
    backgroundHeader: 'rgba(2, 6, 23, 0.85)',
    surface: 'rgba(255, 255, 255, 0.04)',
    surfaceHover: 'rgba(255, 255, 255, 0.07)',
    surfaceAlt: 'rgba(255, 255, 255, 0.025)',
    surfacePill: 'rgba(255, 255, 255, 0.06)',
    text: '#f8fafc',
    textSecondary: '#94a3b8',
    textMuted: '#64748b',
    border: 'rgba(255, 255, 255, 0.1)',
    borderAlt: 'rgba(255, 255, 255, 0.06)',
    divider: 'rgba(255, 255, 255, 0.08)',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#0ea5e9',
    glow1: 'rgba(37, 99, 235, 0.12)',
    glow2: 'rgba(99, 102, 241, 0.10)',
    glow3: 'rgba(16, 185, 129, 0.08)',
  },
  typography: {
    fontFamily: 'Vazirmatn, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
    headingFontFamily: 'Vazirmatn, sans-serif',
    monoFontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    baseFontSize: '14px',
    scaleRatio: 1.2,
    lineHeight: '1.6',
    letterSpacing: '0.01em',
    fontWeights: {
      normal: 400,
      medium: 500,
      bold: 700,
      black: 900,
    },
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },
  radius: {
    none: '0px',
    sm: '6px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    full: '9999px',
  },
  shadows: {
    none: 'none',
    sm: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.2)',
    xl: '0 20px 35px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.3)',
    glow: '0 0 20px rgba(16, 185, 129, 0.3)',
  },
  borders: {
    width: '1px',
    style: 'solid',
    defaultColor: 'rgba(255, 255, 255, 0.1)',
  },
  zIndex: {
    base: 0,
    header: 40,
    sidebar: 30,
    dropdown: 50,
    modal: 60,
    drawer: 55,
    tooltip: 70,
    toast: 80,
  },
};
