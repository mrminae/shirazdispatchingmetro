/**
 * Token Utilities - Transforms DesignTokens into CSS variables
 */

import { DesignTokens } from '../types/schema';

export function designTokensToCssVariables(tokens: DesignTokens): Record<string, string> {
  const vars: Record<string, string> = {};

  // Colors mapping
  vars['--bg-app'] = tokens.colors.background;
  vars['--bg-header'] = tokens.colors.backgroundHeader;
  vars['--bg-card'] = tokens.colors.surface;
  vars['--bg-card-hover'] = tokens.colors.surfaceHover;
  vars['--bg-card-sub'] = tokens.colors.surfaceAlt;
  vars['--bg-pill'] = tokens.colors.surfacePill;

  vars['--color-primary'] = tokens.colors.primary;
  vars['--color-primary-hover'] = tokens.colors.primaryHover;
  vars['--color-primary-active'] = tokens.colors.primaryActive;
  vars['--color-secondary'] = tokens.colors.secondary;
  vars['--color-accent'] = tokens.colors.accent;

  vars['--accent-color'] = tokens.colors.accent;
  vars['--accent-glow'] = tokens.colors.accentGlow;
  vars['--accent-light'] = tokens.colors.accentGlow;

  vars['--text-main'] = tokens.colors.text;
  vars['--text-sub'] = tokens.colors.textSecondary;
  vars['--text-dim'] = tokens.colors.textMuted;

  vars['--border-app'] = tokens.colors.border;
  vars['--border-app-sub'] = tokens.colors.borderAlt;
  vars['--divider-color'] = tokens.colors.divider;

  vars['--color-success'] = tokens.colors.success;
  vars['--color-warning'] = tokens.colors.warning;
  vars['--color-danger'] = tokens.colors.danger;
  vars['--color-info'] = tokens.colors.info;

  if (tokens.colors.glow1) vars['--gradient-glow-1'] = tokens.colors.glow1;
  if (tokens.colors.glow2) vars['--gradient-glow-2'] = tokens.colors.glow2;
  if (tokens.colors.glow3) vars['--gradient-glow-3'] = tokens.colors.glow3;

  // Typography
  vars['--font-family-base'] = tokens.typography.fontFamily;
  vars['--font-family-heading'] = tokens.typography.headingFontFamily;
  vars['--font-family-mono'] = tokens.typography.monoFontFamily;
  vars['--font-size-base'] = tokens.typography.baseFontSize;
  vars['--line-height-base'] = tokens.typography.lineHeight;
  vars['--letter-spacing-base'] = tokens.typography.letterSpacing;

  // Spacing
  vars['--space-xs'] = tokens.spacing.xs;
  vars['--space-sm'] = tokens.spacing.sm;
  vars['--space-md'] = tokens.spacing.md;
  vars['--space-lg'] = tokens.spacing.lg;
  vars['--space-xl'] = tokens.spacing.xl;
  vars['--space-xxl'] = tokens.spacing.xxl;

  // Radius
  vars['--radius-none'] = tokens.radius.none;
  vars['--radius-sm'] = tokens.radius.sm;
  vars['--radius-md'] = tokens.radius.md;
  vars['--radius-lg'] = tokens.radius.lg;
  vars['--radius-xl'] = tokens.radius.xl;
  vars['--radius-full'] = tokens.radius.full;

  // Shadows
  vars['--shadow-none'] = tokens.shadows.none;
  vars['--shadow-sm'] = tokens.shadows.sm;
  vars['--shadow-md'] = tokens.shadows.md;
  vars['--shadow-lg'] = tokens.shadows.lg;
  vars['--shadow-xl'] = tokens.shadows.xl;
  vars['--shadow-glow'] = tokens.shadows.glow;

  // Z-Index
  vars['--z-header'] = String(tokens.zIndex.header);
  vars['--z-sidebar'] = String(tokens.zIndex.sidebar);
  vars['--z-dropdown'] = String(tokens.zIndex.dropdown);
  vars['--z-modal'] = String(tokens.zIndex.modal);
  vars['--z-tooltip'] = String(tokens.zIndex.tooltip);
  vars['--z-toast'] = String(tokens.zIndex.toast);

  return vars;
}

export function applyCssVariablesToDocument(vars: Record<string, string>, targetElement?: HTMLElement): void {
  const root = targetElement || document.documentElement;
  Object.entries(vars).forEach(([key, value]) => {
    if (value) {
      root.style.setProperty(key, value);
    }
  });
}
