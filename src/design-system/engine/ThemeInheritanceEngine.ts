/**
 * Theme Inheritance & Token Override Engine
 * Handles cascading token inheritance, parent-child theme links,
 * override diff calculation, and fallback resolution.
 */

import { ThemeConfig, DesignTokens, ThemeOverrides } from '../types/schema';
import { PRESET_THEMES } from '../themes/presets';

export interface TokenOverrideDetail {
  group: 'colors' | 'typography' | 'spacing' | 'radius' | 'shadows';
  key: string;
  isOverridden: boolean;
  parentValue: any;
  currentValue: any;
}

export class ThemeInheritanceEngine {
  /**
   * Resolve a theme's effective tokens by recursively applying overrides over its parent theme
   */
  public static resolveTokens(
    themeId: string,
    allThemes: Record<string, ThemeConfig>,
    visited = new Set<string>()
  ): DesignTokens {
    const theme = allThemes[themeId] || PRESET_THEMES[themeId] || PRESET_THEMES['occ-dark'];

    // Check if standalone or no parent
    if (!theme.parentThemeId || theme.parentThemeId === themeId || !allThemes[theme.parentThemeId]) {
      return theme.tokens;
    }

    // Circular inheritance guard
    if (visited.has(themeId)) {
      console.warn(`ThemeInheritanceEngine: Circular theme inheritance detected for ${themeId}`);
      return theme.tokens;
    }
    visited.add(themeId);

    // Recursively resolve parent tokens
    const parentTokens = this.resolveTokens(theme.parentThemeId, allThemes, visited);
    
    // Deep clone parent tokens
    const mergedTokens: DesignTokens = JSON.parse(JSON.stringify(parentTokens));

    // Apply color overrides
    if (theme.overrides?.colors) {
      Object.entries(theme.overrides.colors).forEach(([k, v]) => {
        if (v !== undefined) {
          (mergedTokens.colors as any)[k] = v;
        }
      });
    }

    // Apply typography overrides
    if (theme.overrides?.typography) {
      Object.entries(theme.overrides.typography).forEach(([k, v]) => {
        if (v !== undefined) {
          (mergedTokens.typography as any)[k] = v;
        }
      });
    }

    // Apply spacing overrides
    if (theme.overrides?.spacing) {
      Object.entries(theme.overrides.spacing).forEach(([k, v]) => {
        if (v !== undefined) {
          (mergedTokens.spacing as any)[k] = v;
        }
      });
    }

    // Apply radius overrides
    if (theme.overrides?.radius) {
      Object.entries(theme.overrides.radius).forEach(([k, v]) => {
        if (v !== undefined) {
          (mergedTokens.radius as any)[k] = v;
        }
      });
    }

    // Apply shadow overrides
    if (theme.overrides?.shadows) {
      Object.entries(theme.overrides.shadows).forEach(([k, v]) => {
        if (v !== undefined) {
          (mergedTokens.shadows as any)[k] = v;
        }
      });
    }

    return mergedTokens;
  }

  /**
   * Get audit of token overrides for a child theme vs its parent
   */
  public static auditOverrides(
    theme: ThemeConfig,
    allThemes: Record<string, ThemeConfig>
  ): {
    hasParent: boolean;
    parentName?: string;
    overrideCount: number;
    details: TokenOverrideDetail[];
  } {
    if (!theme.parentThemeId || !allThemes[theme.parentThemeId]) {
      return {
        hasParent: false,
        overrideCount: 0,
        details: [],
      };
    }

    const parent = allThemes[theme.parentThemeId];
    const details: TokenOverrideDetail[] = [];
    let count = 0;

    // Colors
    Object.keys(parent.tokens.colors).forEach((key) => {
      const parentVal = (parent.tokens.colors as any)[key];
      const currentVal = (theme.tokens.colors as any)[key];
      const isOverridden = Boolean(theme.overrides?.colors && (theme.overrides.colors as any)[key] !== undefined);
      if (isOverridden) count++;
      details.push({
        group: 'colors',
        key,
        isOverridden,
        parentValue: parentVal,
        currentValue: currentVal,
      });
    });

    return {
      hasParent: true,
      parentName: parent.name,
      overrideCount: count,
      details,
    };
  }

  /**
   * Create a child theme inheriting from a parent
   */
  public static createChildTheme(
    name: string,
    parentThemeId: string,
    allThemes: Record<string, ThemeConfig>,
    initialOverrides: ThemeOverrides = {}
  ): ThemeConfig {
    const parent = allThemes[parentThemeId] || PRESET_THEMES['occ-dark'];
    const newId = `theme_child_${Date.now().toString(36)}`;

    // Resolve merged tokens
    const resolvedTokens = JSON.parse(JSON.stringify(parent.tokens));
    if (initialOverrides.colors) {
      Object.assign(resolvedTokens.colors, initialOverrides.colors);
    }

    return {
      id: newId,
      name,
      englishName: `${parent.englishName} Child`,
      description: `تم فرزند مشتق شده از ${parent.name} با وراثت توکن‌ها`,
      category: parent.category,
      isDark: parent.isDark,
      badge: 'وراثت یافته 🔗',
      parentThemeId,
      overrides: initialOverrides,
      tokens: resolvedTokens,
      previewColor: initialOverrides.colors?.background || parent.previewColor,
      accentColor: initialOverrides.colors?.accent || parent.accentColor,
      cardPreviewColor: initialOverrides.colors?.surface || parent.cardPreviewColor,
    };
  }
}
