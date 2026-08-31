/**
 * Theme & Token Service
 * Manages theme presets, child theme inheritance, overrides, and CSS variable synchronization.
 */

import { ThemeConfig, DesignTokens, ThemeOverrides } from '../types/schema';
import { PRESET_THEMES } from '../themes/presets';
import { ThemeInheritanceEngine, TokenOverrideDetail } from '../engine/ThemeInheritanceEngine';
import { CssVariableEngine } from '../engine/CssVariableEngine';

export class ThemeService {
  /**
   * Get all available preset and custom themes
   */
  public static getThemes(customThemes: Record<string, ThemeConfig> = {}): Record<string, ThemeConfig> {
    return {
      ...PRESET_THEMES,
      ...customThemes,
    };
  }

  /**
   * Resolve effective design tokens for a given theme with inheritance and overrides
   */
  public static resolveTokens(
    themeId: string,
    allThemes: Record<string, ThemeConfig>
  ): DesignTokens {
    return ThemeInheritanceEngine.resolveTokens(themeId, allThemes);
  }

  /**
   * Audit token overrides between a child theme and its parent
   */
  public static auditThemeOverrides(
    theme: ThemeConfig,
    allThemes: Record<string, ThemeConfig>
  ): {
    hasParent: boolean;
    parentName?: string;
    overrideCount: number;
    details: TokenOverrideDetail[];
  } {
    return ThemeInheritanceEngine.auditOverrides(theme, allThemes);
  }

  /**
   * Create a new child theme with inheritance
   */
  public static createChildTheme(
    name: string,
    parentThemeId: string,
    allThemes: Record<string, ThemeConfig>,
    initialOverrides: ThemeOverrides = {}
  ): ThemeConfig {
    return ThemeInheritanceEngine.createChildTheme(name, parentThemeId, allThemes, initialOverrides);
  }

  /**
   * Apply design tokens to document root as CSS custom properties
   */
  public static applyTokensToDom(tokens: DesignTokens, isDark: boolean = true): void {
    CssVariableEngine.getInstance().applyTokens(tokens, isDark);
  }
}
