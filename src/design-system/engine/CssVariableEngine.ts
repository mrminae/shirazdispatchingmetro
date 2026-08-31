/**
 * CSS Variable Engine
 * Dynamically converts DesignTokens into live CSS variables and applies them to the document.
 */

import { DesignTokens, ThemeConfig } from '../types/schema';
import { designTokensToCssVariables, applyCssVariablesToDocument } from '../tokens/tokenUtils';

export class CssVariableEngine {
  private static instance: CssVariableEngine;
  private currentTokens: DesignTokens | null = null;
  private currentThemeId: string = 'occ-dark';

  private constructor() {}

  public static getInstance(): CssVariableEngine {
    if (!CssVariableEngine.instance) {
      CssVariableEngine.instance = new CssVariableEngine();
    }
    return CssVariableEngine.instance;
  }

  /**
   * Applies the theme configuration to the active DOM document
   */
  public applyTheme(theme: ThemeConfig): void {
    this.currentThemeId = theme.id;
    this.currentTokens = theme.tokens;

    const cssVars = designTokensToCssVariables(theme.tokens);
    applyCssVariablesToDocument(cssVars);

    // Synchronize HTML element classes
    const root = document.documentElement;
    
    // Remove old theme classes
    Array.from(root.classList).forEach((cls) => {
      if (cls.startsWith('theme-')) {
        root.classList.remove(cls);
      }
    });

    root.classList.add(`theme-${theme.id}`);

    if (theme.isDark) {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }

  /**
   * Applies raw design tokens directly (e.g. during live editing in Theme Builder)
   */
  public applyTokens(tokens: DesignTokens, isDark: boolean = true): void {
    this.currentTokens = tokens;
    const cssVars = designTokensToCssVariables(tokens);
    applyCssVariablesToDocument(cssVars);

    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }

  /**
   * Generates a pure CSS string with all token variables for exporting to a standalone stylesheet.
   */
  public generateCssString(tokens: DesignTokens, selector: string = ':root'): string {
    const cssVars = designTokensToCssVariables(tokens);
    const rules = Object.entries(cssVars)
      .map(([key, val]) => `  ${key}: ${val};`)
      .join('\n');
    return `${selector} {\n${rules}\n}\n`;
  }
}
